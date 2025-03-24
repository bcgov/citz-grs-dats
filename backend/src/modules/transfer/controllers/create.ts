import type { Request, Response } from "express";
import {
  errorWrapper,
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { createTransferBodySchema } from "../schemas";
import { TransferService } from "src/modules/transfer/services";
import { download, upload } from "src/modules/s3/utils";
import { ENV } from "src/config";
import { streamToBuffer, logs, formatFileSize } from "src/utils";
import { addToStandardTransferQueue } from "src/modules/rabbit/utils/queue/transfer";
import {
  addFileToZipBuffer,
  getFileFromZipBuffer,
  getFilenameByRegex,
  getMetadata,
  handleTransferChunkUpload,
  validateContentMatchesMetadata,
  validateDigitalFileList,
  validateMetadataFiles,
  validateMetadataFoldersMatchesFiles,
  validateStandardTransferStructure,
  validateSubmissionAgreement,
} from "../utils";
import type { TransferMongoose } from "../entities";
import { generateChecksum } from "@/utils/generateChecksum";

const {
  TRANSFER: {
    CONTROLLER: { SUB_AGREEMENT_NOT_FOUND, USING_S3_SUB_AGREEMENT },
  },
} = logs;

const { S3_BUCKET } = ENV;

// Create standard transfer.
export const create = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user, file } = req;
  const body = getZodValidatedBody(createTransferBodySchema); // Validate request body
  const chunkBuffer = file?.buffer;
  let usedSubmissionAgreementfromS3 = false;

  const { accession, application } = body;
  const chunkIndex = Number.parseInt(body.chunkIndex);
  const totalChunks = Number.parseInt(body.totalChunks);
  const receivedChecksum = body.contentChecksum;

  if (!chunkBuffer) {
    throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Chunk data missing.");
  }

  // Process chunk upload and check if file is fully reconstructed
  let contentZipBuffer = await handleTransferChunkUpload({
    accession,
    application,
    chunkIndex,
    totalChunks,
    receivedChecksum,
    chunkBuffer,
  });

  // If not all chunks received yet, return success response to continue upload
  if (!contentZipBuffer) {
    const jsonResponse = getStandardResponse({
      message: `Chunk ${
        chunkIndex + 1
      } received. Waiting for remaining chunks.`,
      success: true,
      data: {
        chunkSize: formatFileSize(chunkBuffer.length),
        chunkIndex,
        totalChunks,
      },
    });

    return res.status(HTTP_STATUS_CODES.ACCEPTED).json(jsonResponse);
  }

  const jobID = `job-${Date.now()}`;

  let subAgreementPath = await getFilenameByRegex({
    buffer: contentZipBuffer,
    directory: "documentation/",
    regex: /^Submission_Agreement/,
  });

  if (!subAgreementPath) {
    let subAgreementStream = undefined;

    try {
      subAgreementStream = await download({
        bucketName: S3_BUCKET,
        key: `submission-agreements/${accession}_${application}.pdf`,
      });

      if (!subAgreementStream) throw new Error("Missing submission agreement.");
    } catch (error) {
      throw new HttpError(
        HTTP_STATUS_CODES.NOT_FOUND,
        "Submission Agreement (beginning with 'Submission_Agreement') must be included and have a .pdf extension in the documentation directory."
      );
    }

    console.log(SUB_AGREEMENT_NOT_FOUND(accession, application));

    const s3SubAgreementBuffer = await streamToBuffer(subAgreementStream);

    if (s3SubAgreementBuffer) {
      console.log(USING_S3_SUB_AGREEMENT(accession, application));
      usedSubmissionAgreementfromS3 = true;
    }

    const newSubAgreementName = `Submission_Agreement_${accession}_${application}.pdf`;
    subAgreementPath = `documentation/${newSubAgreementName}`;

    // Add agreement to zip buffer
    contentZipBuffer = await addFileToZipBuffer({
      zipBuffer: contentZipBuffer,
      fileBuffer: s3SubAgreementBuffer,
      filePath: subAgreementPath,
    });
  }

  // Validate transfer buffer
  await validateStandardTransferStructure({ buffer: contentZipBuffer });
  await validateMetadataFiles({
    buffer: contentZipBuffer,
    accession,
    application,
  });

  const fileListPath = await getFilenameByRegex({
    buffer: contentZipBuffer,
    directory: "documentation/",
    regex: /^(Digital_File_List|File\sList)/,
  });

  if (!fileListPath)
    throw new HttpError(
      HTTP_STATUS_CODES.NOT_FOUND,
      "File List could not be found in the documentation directory."
    );

  const fileListBuffer = await getFileFromZipBuffer(
    contentZipBuffer,
    fileListPath
  );
  const submissionAgreementBuffer = await getFileFromZipBuffer(
    contentZipBuffer,
    subAgreementPath
  );

  await validateDigitalFileList({
    buffer: fileListBuffer,
    accession,
    application,
  });
  await validateSubmissionAgreement({
    buffer: submissionAgreementBuffer,
    accession,
    application,
  });

  const metadata = await getMetadata(contentZipBuffer);

  await validateContentMatchesMetadata({ buffer: contentZipBuffer, metadata });
  validateMetadataFoldersMatchesFiles({ metadata });

  // Create new checksum incase changes were made to buffer
  const newChecksum = generateChecksum(contentZipBuffer);

  // Save data for transfer to Mongo
  await TransferService.createOrUpdateTransferEntry({
    accession,
    application,
    jobID,
    checksum: newChecksum,
    status: "Transferring",
    user,
    folders: metadata.folders as unknown as NonNullable<
      TransferMongoose["metadata"]
    >["folders"],
    files: metadata.files as unknown as NonNullable<
      TransferMongoose["metadata"]
    >["files"],
  });

  // Save to s3
  const s3Location = await upload({
    bucketName: S3_BUCKET,
    key: `transfers/TR_${accession}_${application}.zip`,
    content: contentZipBuffer,
  });

  // Add the job ID to the RabbitMQ queue
  await addToStandardTransferQueue(jobID);

  const result = getStandardResponse({
    data: {
      user: `${user?.first_name} ${user?.last_name}`,
      jobID,
      accession,
      application,
      fileLocation: s3Location,
      note: "",
    },
    message: "Job added to queue.",
    success: true,
  });

  if (result.data && usedSubmissionAgreementfromS3)
    result.data.note =
      "Used submission agreement from s3 because one was not provided in the transfer input.";

  res.status(HTTP_STATUS_CODES.CREATED).json(result);
});
