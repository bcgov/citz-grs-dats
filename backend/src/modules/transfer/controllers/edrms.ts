import type { Request, Response } from "express";
import {
  errorWrapper,
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { edrmsTransferBodySchema } from "../schemas";
import { upload } from "src/modules/s3/utils";
import { ENV } from "src/config";
import { decodeKeysBase64, formatDate, formatFileSize } from "src/utils";
import { createAgreementPDF } from "@/modules/submission-agreement/utils";
import type { FolderRow } from "@/modules/filelist/utils/excel/worksheets";
import { createExcelWorkbook } from "@/modules/filelist/utils/excel";
import type { FileMetadataZodType } from "@/modules/filelist/schemas";
import {
  callTransferEndpoint,
  createStandardTransferZip,
  handleTransferChunkUpload,
} from "../utils";
import type { Workbook } from "exceljs";
import { TransferService } from "../services";
import { Readable } from "node:stream";

const { S3_BUCKET } = ENV;

// Create edrms transfer.
export const edrms = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user, token, files } = req;
  const body = getZodValidatedBody(edrmsTransferBodySchema); // Validate request body

  const metadata = body.metadata;
  metadata.folders = decodeKeysBase64(metadata.folders);
  metadata.files = decodeKeysBase64(metadata.files);
  const extendedMetadata = decodeKeysBase64(body.extendedMetadata);

  const { accession, application } = body.metadata.admin;
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

  const dataportBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "dataportBuffer"
  )?.buffer;
  const fileListBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "fileListBuffer"
  )?.buffer;
  const transferFormBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "transferFormBuffer"
  )?.buffer;

  if (
    !dataportBuffer ||
    !fileListBuffer ||
    !transferFormBuffer ||
    !contentZipStream
  )
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "Missing one or many of dataportBuffer, fileListBuffer, transferFormBuffer, contentZipBuffer."
    );

  // Save data for transfer
  await TransferService.createOrUpdateTransferEntry({
    user,
    application: metadata.admin?.application,
    accession: metadata.admin?.accession,
    folders: metadata.folders,
    files: metadata.files,
    extendedMetadata,
  });

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
  const folderRows = Object.entries(metadata.folders).map(
    ([folder, metadata]) => ({
      folder, // Add the key as the "folder" property
      ...(metadata as unknown[]), // Spread the properties of the metadata
    })
  ) as FolderRow[];

  // Format file rows
  const fileRows = Object.values(
    metadata.files
  ).flat() as FileMetadataZodType[];

  // Create Digital File List
  // Based on metadata from dataport file, EDRMS file list is different.
  const date = formatDate(new Date().toISOString());
  const digitalFilelistFilename = `Digital_File_List_${date}.xlsx`;

  // Create workbook
  const workbook: Workbook = createExcelWorkbook({
    folderRows,
    fileRows,
    accession,
    application,
  });

  // Create buffer
  const digitalFileListBuffer = await workbook.xlsx.writeBuffer();

  // Add submitted by info to admin metadata
  const updatedAdminMetadata = {
    ...metadata.admin,
    submittedBy: {
      name: user?.display_name ?? "",
      email: user?.email ?? "",
    },
  };

  // Metadata files
  const adminJsonStream = Readable.from(
    JSON.stringify(updatedAdminMetadata, null, 2)
  );
  const foldersJsonStream = Readable.from(
    JSON.stringify(metadata.folders, null, 2)
  );
  const filesJsonStream = Readable.from(
    JSON.stringify(metadata.files, null, 2)
  );
  const extendedMetadataJsonStream = Readable.from(
    JSON.stringify(extendedMetadata, null, 2)
  );

  // Put together zip buffer
  const standardTransferZipBuffer = await createStandardTransferZip({
    contentZipStream,
    documentation: {
      [digitalFilelistFilename]:
        digitalFileListBuffer as unknown as Buffer<ArrayBufferLike>,
      [body.transferFormFilename]: transferFormBuffer,
      "Submission_Agreement.pdf": subAgreementBuffer,
      [body.fileListFilename]: fileListBuffer,
      [body.dataportFilename]: dataportBuffer,
    },
    metadata: {
      "admin.json": adminJsonStream,
      "folders.json": foldersJsonStream,
      "files.json": filesJsonStream,
      "extended.json": extendedMetadataJsonStream,
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
