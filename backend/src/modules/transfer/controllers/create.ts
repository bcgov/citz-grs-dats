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
import { logs, formatFileSize, writeStreamToTempFile } from "src/utils";
import { addToStandardTransferQueue } from "src/modules/rabbit/utils/queue/transfer";
import {
  addFileToZipStream,
  getFileFromZipStream,
  getFilenameByRegex,
  getMetadata,
  handleTransferChunkUpload,
  validateContentMatchesMetadata,
  validateDigitalFileList,
  validateMetadataFiles,
  validateMetadataFoldersMatchesFiles,
  validateStandardTransferStructure,
} from "../utils";
import type { TransferMongoose } from "../entities";
import { generateChecksum } from "@/utils/generateChecksum";
import fs from "node:fs";

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
  let contentZipStream = await handleTransferChunkUpload({
    accession,
    application,
    chunkIndex,
    totalChunks,
    receivedChecksum,
    chunkBuffer,
  });

  // If not all chunks received yet, return success response to continue upload
  if (!contentZipStream) {
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

  const tempContentStreamPath = await writeStreamToTempFile(contentZipStream);

  try {
    // Clone the content zip stream for validation
    const contentStream1 = fs.createReadStream(tempContentStreamPath);
    const contentStream2 = fs.createReadStream(tempContentStreamPath);
    const contentStream3 = fs.createReadStream(tempContentStreamPath);
    const contentStream4 = fs.createReadStream(tempContentStreamPath);
    const contentStream5 = fs.createReadStream(tempContentStreamPath);
    const contentStream6 = fs.createReadStream(tempContentStreamPath);
    const contentStream7 = fs.createReadStream(tempContentStreamPath);
    const contentStream8 = fs.createReadStream(tempContentStreamPath);
    const contentStream9 = fs.createReadStream(tempContentStreamPath);
    const contentStream10 = fs.createReadStream(tempContentStreamPath);

    let subAgreementPath = await getFilenameByRegex({
      stream: contentStream1,
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

        if (!subAgreementStream)
          throw new Error("Missing submission agreement.");
      } catch (error) {
        throw new HttpError(
          HTTP_STATUS_CODES.NOT_FOUND,
          "Submission Agreement (beginning with 'Submission_Agreement') must be included and have a .pdf extension in the documentation directory."
        );
      }

      console.log(SUB_AGREEMENT_NOT_FOUND(accession, application));

      if (subAgreementStream) {
        console.log(USING_S3_SUB_AGREEMENT(accession, application));
        usedSubmissionAgreementfromS3 = true;
      }

      const newSubAgreementName = `Submission_Agreement_${accession}_${application}.pdf`;
      subAgreementPath = `documentation/${newSubAgreementName}`;

      // Add agreement to zip stream
      contentZipStream = await addFileToZipStream({
        zipStream: contentStream2,
        fileStream: subAgreementStream,
        filePath: subAgreementPath,
      });
    }

    // Validate transfer
    await validateStandardTransferStructure({ stream: contentStream3 });
    await validateMetadataFiles({
      stream: contentStream4,
      accession,
      application,
    });

    const fileListPath = await getFilenameByRegex({
      stream: contentStream5,
      directory: "documentation/",
      regex: /^(Digital_File_List|File\sList)/,
    });

    if (!fileListPath)
      throw new HttpError(
        HTTP_STATUS_CODES.NOT_FOUND,
        "File List could not be found in the documentation directory."
      );

    const fileListStream = await getFileFromZipStream(
      contentStream6,
      fileListPath
    );
    if (!fileListStream)
      throw new HttpError(
        HTTP_STATUS_CODES.NOT_FOUND,
        "File List could not be found in the documentation directory."
      );

    await validateDigitalFileList({
      stream: fileListStream,
      path: fileListPath,
      accession,
      application,
    });

    const metadata = await getMetadata(contentStream7);

    await validateContentMatchesMetadata({ stream: contentStream8, metadata });
    validateMetadataFoldersMatchesFiles({ metadata });

    // Create new checksum incase changes were made
    const newChecksum = await generateChecksum(contentStream9);

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
      content: contentStream10,
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
  } finally {
    // Clean up the temporary file
    fs.unlink(tempContentStreamPath, (err) => {
      if (err) {
        console.error(
          `Failed to delete temp file: ${tempContentStreamPath}`,
          err
        );
      }
    });
  }
});
