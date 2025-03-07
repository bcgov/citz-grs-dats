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
import { streamToBuffer, logs } from "src/utils";
import { addToStandardTransferQueue } from "src/modules/rabbit/utils/queue/transfer";
import {
  addFileToZipBuffer,
  getFileFromZipBuffer,
  getFilenameByRegex,
  getMetadata,
  isChecksumValid,
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
  let buffer = file?.buffer;
  let usedSubmissionAgreementfromS3 = false;

  if (!buffer)
    throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Missing buffer.");

  const bufferChecksumValid = await isChecksumValid({
    buffer,
    checksum: body.checksum,
  });

  if (!bufferChecksumValid)
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "Checksum of buffer and body.checksum do not match."
    );

  const jobID = `job-${Date.now()}`;

  let subAgreementPath = await getFilenameByRegex({
    buffer,
    directory: "documentation/",
    regex: /^Submission_Agreement/,
  });

  if (!subAgreementPath) {
    let subAgreementStream = undefined;

    try {
      subAgreementStream = await download({
        bucketName: S3_BUCKET,
        key: `submission-agreements/${body.accession}_${body.application}.pdf`,
      });

      if (!subAgreementStream) throw new Error("Missing submission agreement.");
    } catch (error) {
      throw new HttpError(
        HTTP_STATUS_CODES.NOT_FOUND,
        "Submission Agreement (beginning with 'Submission_Agreement') must be included and have a .pdf extension in the documentation directory."
      );
    }

    console.log(SUB_AGREEMENT_NOT_FOUND(body.accession, body.application));

    const s3SubAgreementBuffer = await streamToBuffer(subAgreementStream);

    if (s3SubAgreementBuffer) {
      console.log(USING_S3_SUB_AGREEMENT(body.accession, body.application));
      usedSubmissionAgreementfromS3 = true;
    }

    const newSubAgreementName = `Submission_Agreement_${body.accession}_${body.application}.pdf`;
    subAgreementPath = `documentation/${newSubAgreementName}`;

    // Add agreement to zip buffer
    buffer = await addFileToZipBuffer({
      zipBuffer: buffer,
      fileBuffer: s3SubAgreementBuffer,
      filePath: subAgreementPath,
    });
  }

  // Validate transfer buffer
  await validateStandardTransferStructure({ buffer });
  await validateMetadataFiles({
    buffer,
    accession: body.accession,
    application: body.application,
  });

  const fileListPath = await getFilenameByRegex({
    buffer,
    directory: "documentation/",
    regex: /^(Digital_File_List|File\sList)/,
  });

  if (!fileListPath)
    throw new HttpError(
      HTTP_STATUS_CODES.NOT_FOUND,
      "File List could not be found in the documentation directory."
    );

  const fileListBuffer = await getFileFromZipBuffer(buffer, fileListPath);
  const submissionAgreementBuffer = await getFileFromZipBuffer(
    buffer,
    subAgreementPath
  );

  await validateDigitalFileList({
    buffer: fileListBuffer,
    accession: body.accession,
    application: body.application,
  });
  await validateSubmissionAgreement({
    buffer: submissionAgreementBuffer,
    accession: body.accession,
    application: body.application,
  });

  const metadata = await getMetadata(buffer);

  await validateContentMatchesMetadata({ buffer, metadata });
  validateMetadataFoldersMatchesFiles({ metadata });

  // Create new checksum incase changes were made to buffer
  const newChecksum = generateChecksum(buffer);

  // Save data for transfer to Mongo
  await TransferService.createOrUpdateTransferEntry({
    accession: body.accession,
    application: body.application,
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
    key: `transfers/TR_${body.accession}_${body.application}.zip`,
    content: buffer,
  });

  // Add the job ID to the RabbitMQ queue
  await addToStandardTransferQueue(jobID);

  const result = getStandardResponse({
    data: {
      user: `${user?.first_name} ${user?.last_name}`,
      jobID,
      accession: body.accession,
      application: body.application,
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
