import type { Request, Response } from "express";
import {
  errorWrapper,
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { edrmsTransferBodySchema } from "../schemas";
import { upload } from "src/modules/s3/utils";
import { ENV } from "src/config";
import { formatDate, formatFileSize } from "src/utils";
import { createAgreementPDF } from "@/modules/submission-agreement/utils";
import type { FolderRow } from "@/modules/filelist/utils/excel/worksheets";
import { createExcelWorkbook } from "@/modules/filelist/utils/excel";
import type { FileMetadataZodType } from "@/modules/filelist/schemas";
import {
  callTransferEndpoint,
  createStandardTransferZip,
  handleTransferChunkUpload,
} from "../utils";
import crypto from "node:crypto";
import type { Workbook } from "exceljs";
import { TransferService } from "../services";

const { S3_BUCKET } = ENV;

// Create edrms transfer.
export const edrms = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user, token, files } = req;
  const body = getZodValidatedBody(edrmsTransferBodySchema); // Validate request body

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
  const contentZipBuffer = await handleTransferChunkUpload({
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
    !contentZipBuffer
  )
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "Missing one or many of dataportBuffer, fileListBuffer, transferFormBuffer, contentZipBuffer."
    );

  // Save data for transfer
  await TransferService.createOrUpdateTransferEntry({
    user,
    application: body.metadata?.admin?.application,
    accession: body.metadata?.admin?.accession,
    folders: body.metadata.folders,
    files: body.metadata.files,
    extendedMetadata: body.extendedMetadata,
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
  const folderRows = Object.entries(body.metadata.folders).map(
    ([folder, metadata]) => ({
      folder, // Add the key as the "folder" property
      ...(metadata as unknown[]), // Spread the properties of the metadata
    })
  ) as FolderRow[];

  // Format file rows
  const fileRows = Object.values(
    body.metadata.files
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
  const digitalFileListBuffer = (await workbook.xlsx.writeBuffer()) as Buffer;

  // Add submitted by info to admin metadata
  const updatedAdminMetadata = {
    ...body.metadata.admin,
    submittedBy: {
      name: user?.display_name ?? "",
      email: user?.email ?? "",
    },
  };

  // Metadata files
  const adminJsonBuffer = Buffer.from(
    JSON.stringify(updatedAdminMetadata),
    "utf-8"
  );
  const foldersJsonBuffer = Buffer.from(
    JSON.stringify(body.metadata.folders),
    "utf-8"
  );
  const filesJsonBuffer = Buffer.from(
    JSON.stringify(body.metadata.files),
    "utf-8"
  );
  const extendedMetadataJsonBuffer = Buffer.from(
    JSON.stringify(body.extendedMetadata),
    "utf-8"
  );

  // Put together zip buffer
  const standardTransferZipBuffer = await createStandardTransferZip({
    contentZipBuffer,
    documentation: {
      [digitalFilelistFilename]: digitalFileListBuffer,
      [body.transferFormFilename]: transferFormBuffer,
      "Submission_Agreement.pdf": subAgreementBuffer,
      [body.fileListFilename]: fileListBuffer,
      [body.dataportFilename]: dataportBuffer,
    },
    metadata: {
      "admin.json": adminJsonBuffer,
      "folders.json": foldersJsonBuffer,
      "files.json": filesJsonBuffer,
      "extended.json": extendedMetadataJsonBuffer,
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
