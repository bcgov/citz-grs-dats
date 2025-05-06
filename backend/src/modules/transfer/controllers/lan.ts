import type { Request, Response } from "express";
import {
  errorWrapper,
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { lanTransferBodySchema } from "../schemas";
import { upload } from "src/modules/s3/utils";
import { ENV } from "src/config";
import { decodeKeysBase64, formatDate, formatFileSize } from "src/utils";
import { createAgreementPDF } from "@/modules/submission-agreement/utils";
import type { FolderRow } from "@/modules/filelist/utils/excel/worksheets";
import { updateFileListV2 } from "@/modules/filelist/utils/excel";
import type { FileMetadataZodType } from "@/modules/filelist/schemas";
import {
  callTransferEndpoint,
  createStandardTransferZip,
  handleTransferChunkUpload,
} from "../utils";
import { TransferService } from "../services";
import { Readable } from "node:stream";

const { S3_BUCKET } = ENV;

// Create lan transfer.
export const lan = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user, token, files } = req;
  const body = getZodValidatedBody(lanTransferBodySchema); // Validate request body

  const metadataV2Folders = decodeKeysBase64(body.metadataV2.folders);
  const metadataV2Files = decodeKeysBase64(body.metadataV2.files);
  const extendedMetadata = decodeKeysBase64(body.extendedMetadata);

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
  const contentZipStream = await handleTransferChunkUpload({
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

  const fileListBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "fileListBuffer"
  )?.buffer;
  const transferFormBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "transferFormBuffer"
  )?.buffer;

  if (!fileListBuffer || !transferFormBuffer || !contentZipStream)
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "Missing one or many of fileListBuffer, transferFormBuffer, contentZipBuffer."
    );

  // Create submission agreement file
  const subAgreementBuffer = await createAgreementPDF({
    ministrySignature: `${user?.first_name} ${user?.last_name}`,
    ministryDate: formatDate(new Date().toISOString()),
    accession,
    application,
  });

  // Save submission agreement to s3
  await upload({
    bucketName: S3_BUCKET,
    key: `submission-agreements/${accession}_${application}.pdf`,
    content: subAgreementBuffer,
  });

  // Format folder rows
  const folderRows = Object.entries(metadataV2Folders).map(
    ([folder, metadata]) => ({
      folder, // Add the key as the "folder" property
      ...(metadata as unknown[]), // Spread the properties of the metadata
    })
  ) as FolderRow[];

  // Format file rows
  const fileRows = Object.values(
    metadataV2Files
  ).flat() as FileMetadataZodType[];

  // Update File List
  const fileListStream = await updateFileListV2({
    folders: folderRows,
    files: fileRows,
    changes: body.changes,
    fileListBuffer,
  });

  // Notes text
  const notesStream =
    body.changesJustification !== ""
      ? Readable.from(
          `Justification for changes to the file list: ${body.changesJustification}`
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

  // Get original extended metadata
  const transferEntry = await TransferService.getTransferWhere({
    "metadata.admin.accession": accession,
    "metadata.admin.application": application,
  });
  const originalExtendedMetadataJson = transferEntry?.extendedMetadata ?? {};

  // Metadata files
  const adminJsonStream = Readable.from(JSON.stringify(updatedAdminMetadata));
  const foldersJsonStream = Readable.from(JSON.stringify(metadataV2Folders));
  const filesJsonStream = Readable.from(JSON.stringify(metadataV2Files));
  const extendedMetadataJsonStream = Readable.from(
    JSON.stringify(extendedMetadata)
  );
  const originalExtendedMetadataJsonStream = Readable.from(
    JSON.stringify(originalExtendedMetadataJson)
  );

  const today = new Date().toISOString().split("T")[0];

  // Put together zip buffer
  const standardTransferZipBuffer = await createStandardTransferZip({
    contentZipStream,
    documentation: {
      [body.fileListFilename]: fileListStream,
      [body.transferFormFilename]: transferFormBuffer,
      "Submission_Agreement.pdf": subAgreementBuffer,
    },
    metadata: {
      "admin.json": adminJsonStream,
      "folders.json": foldersJsonStream,
      "files.json": filesJsonStream,
      [`extended_new_${today}.json`]: extendedMetadataJsonStream,
      "extended_original.json": originalExtendedMetadataJsonStream,
      "notes.txt": notesStream,
    },
  });

  // Make request to standard transfer
  const {
    message: transferResMessage,
    data: transferResData,
    success: transferResSuccess,
  } = await callTransferEndpoint({
    token,
    standardTransferZipBuffer,
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
