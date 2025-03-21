import type { Request, Response } from "express";
import {
  errorWrapper,
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { lanTransferBodySchema } from "../schemas";
import { upload } from "src/modules/s3/utils";
import { ENV } from "src/config";
import { formatDate } from "src/utils";
import { createAgreementPDF } from "@/modules/submission-agreement/utils";
import type { FolderRow } from "@/modules/filelist/utils/excel/worksheets";
import { updateFileListV2 } from "@/modules/filelist/utils/excel";
import type { FileMetadataZodType } from "@/modules/filelist/schemas";
import {
  callTransferEndpoint,
  createStandardTransferZip,
  handleTransferChunkUpload,
} from "../utils";
import crypto from "node:crypto";
import { TransferService } from "../services";

const { S3_BUCKET } = ENV;

// Create lan transfer.
export const lan = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user, token, files } = req;
  const body = getZodValidatedBody(lanTransferBodySchema); // Validate request body

  const { accession, application } = body.metadataV2.admin;
  const chunkIndex = Number.parseInt(body.chunkIndex);
  const totalChunks = Number.parseInt(body.totalChunks);
  const receivedChecksum = body.contentChecksum;

  const chunkBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "contentZipChunk"
  )?.buffer;

  if (!chunkBuffer) {
    throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Chunk data missing.");
  }

  // Process chunk upload and check if file is fully reconstructed
  const contentZipBuffer = await handleTransferChunkUpload({
    accession,
    application,
    chunkIndex,
    totalChunks,
    receivedChecksum,
    chunkBuffer,
  });

  console.log("Returned content zip buffer");

  // If not all chunks received yet, return success response to continue upload
  if (!contentZipBuffer) {
    console.log("Missing content zip buffer");
    const jsonResponse = getStandardResponse({
      message: `Chunk ${
        chunkIndex + 1
      } received. Waiting for remaining chunks.`,
      success: true,
    });

    return res.status(HTTP_STATUS_CODES.ACCEPTED).json(jsonResponse);
  }

  console.log("Getting filelist buffer");
  let fileListBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "fileListBuffer"
  )?.buffer;
  console.log("Getting transfer form buffer");
  const transferFormBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "transferFormBuffer"
  )?.buffer;

  if (!fileListBuffer || !transferFormBuffer || !contentZipBuffer)
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "Missing one or many of fileListBuffer, transferFormBuffer, contentZipBuffer."
    );

  console.log("Creating submission agreement");

  // Create submission agreement file
  const subAgreementBuffer = await createAgreementPDF({
    ministrySignature: `${user?.first_name} ${user?.last_name}`,
    ministryDate: formatDate(new Date().toISOString()),
    accession,
    application,
  });

  console.log("Uploading submission agreement to s3");

  // Save submission agreement to s3
  await upload({
    bucketName: S3_BUCKET,
    key: `submission-agreements/${accession}_${application}.pdf`,
    content: subAgreementBuffer,
  });

  console.log("Formatting folder rows");

  // Format folder rows
  const folderRows = Object.entries(body.metadataV2.folders).map(
    ([folder, metadata]) => ({
      folder, // Add the key as the "folder" property
      ...(metadata as unknown[]), // Spread the properties of the metadata
    })
  ) as FolderRow[];

  console.log("Formatting file rows");

  // Format file rows
  const fileRows = Object.values(
    body.metadataV2.files
  ).flat() as FileMetadataZodType[];

  console.log("Updating file list v2");

  // Update File List
  fileListBuffer = await updateFileListV2({
    folders: folderRows,
    files: fileRows,
    changes: body.changes,
    fileListBuffer,
  });

  // Notes text
  const notesBuffer =
    body.changesJustification !== ""
      ? Buffer.from(
          `Justification for changes to the file list: ${body.changesJustification}`,
          "utf-8"
        )
      : null;

  // Add submitted by info to admin metadata
  const updatedAdminMetadata = {
    ...body.metadataV2.admin,
    submittedBy: {
      name: user?.display_name ?? "",
      email: user?.email ?? "",
    },
  };

  console.log("Getting transfer entry");

  // Get original extended metadata
  const transferEntry = await TransferService.getTransferWhere({
    "metadata.admin.accession": accession,
    "metadata.admin.application": application,
  });
  const originalExtendedMetadataJson = transferEntry?.extendedMetadata ?? {};

  console.log("Creating json buffers");

  // Metadata files
  const adminJsonBuffer = Buffer.from(
    JSON.stringify(updatedAdminMetadata),
    "utf-8"
  );
  const foldersJsonBuffer = Buffer.from(
    JSON.stringify(body.metadataV2.folders),
    "utf-8"
  );
  const filesJsonBuffer = Buffer.from(
    JSON.stringify(body.metadataV2.files),
    "utf-8"
  );
  const extendedMetadataJsonBuffer = Buffer.from(
    JSON.stringify(body.extendedMetadata),
    "utf-8"
  );
  const originalExtendedMetadataJsonBuffer = Buffer.from(
    JSON.stringify(originalExtendedMetadataJson),
    "utf-8"
  );

  const today = new Date().toISOString().split("T")[0];

  console.log("Creating standard transfer zip");

  // Put together zip buffer
  const standardTransferZipBuffer = await createStandardTransferZip({
    contentZipBuffer,
    documentation: {
      [body.fileListFilename]: fileListBuffer,
      [body.transferFormFilename]: transferFormBuffer,
      "Submission_Agreement.pdf": subAgreementBuffer,
    },
    metadata: {
      "admin.json": adminJsonBuffer,
      "folders.json": foldersJsonBuffer,
      "files.json": filesJsonBuffer,
      [`extended_new_${today}.json`]: extendedMetadataJsonBuffer,
      "extended_original.json": originalExtendedMetadataJsonBuffer,
      "notes.txt": notesBuffer,
    },
  });

  console.log("Checksum of zip buffer");

  // Make checksum of zip buffer
  const standardTransferHash = crypto.createHash("sha256");
  standardTransferHash.update(standardTransferZipBuffer);
  const standardTransferZipChecksum = standardTransferHash.digest("hex");

  console.log("Call transfer endpoint");

  // Make request to standard transfer
  const {
    message: transferResMessage,
    data: transferResData,
    success: transferResSuccess,
  } = await callTransferEndpoint({
    token,
    standardTransferZipBuffer,
    standardTransferZipChecksum,
    accession,
    application,
  });

  // Standardizes the response format
  const result = getStandardResponse({
    data: transferResData,
    message: transferResMessage,
    success: transferResSuccess,
  });

  res
    .status(
      transferResSuccess
        ? HTTP_STATUS_CODES.CREATED
        : HTTP_STATUS_CODES.BAD_REQUEST
    )
    .json(result);
});
