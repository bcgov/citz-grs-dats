import type { Request, Response } from "express";
import {
  errorWrapper,
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { edrmsTransferBodySchema } from "../schemas";
import { upload } from "src/modules/s3/utils";
import { ENV } from "src/config";
import { formatDate } from "src/utils";
import { createAgreementPDF } from "@/modules/submission-agreement/utils";
import type { FolderRow } from "@/modules/filelist/utils/excel/worksheets";
import { createExcelWorkbook } from "@/modules/filelist/utils/excel";
import type { FileMetadataZodType } from "@/modules/filelist/schemas";
import { callTransferEndpoint, createStandardTransferZip } from "../utils";
import crypto from "node:crypto";
import type { Workbook } from "exceljs";

const { S3_BUCKET } = ENV;

// Create edrms transfer.
export const edrms = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user, token, files } = req;
  const body = getZodValidatedBody(edrmsTransferBodySchema); // Validate request body

  const dataportBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "dataportBuffer"
  )?.buffer;
  const fileListBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "fileListBuffer"
  )?.buffer;
  const transferFormBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "transferFormBuffer"
  )?.buffer;
  const contentZipBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "contentZipBuffer"
  )?.buffer;

  const accession = body.metadata.admin.accession;
  const application = body.metadata.admin.application;

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
      fileList: {
        filename: digitalFilelistFilename,
        buffer: digitalFileListBuffer,
      },
      transferForm: {
        filename: body.transferFormFilename,
        buffer: transferFormBuffer,
      },
      subAgreement: {
        filename: "Submission_Agreement.pdf",
        buffer: subAgreementBuffer,
      },
      edrmsFilelist: {
        filename: body.fileListFilename,
        buffer: fileListBuffer,
      },
      edrmsDataport: {
        filename: body.dataportFilename,
        buffer: dataportBuffer,
      },
    },
    metadata: {
      adminBuffer: adminJsonBuffer,
      foldersBuffer: foldersJsonBuffer,
      filesBuffer: filesJsonBuffer,
      extendedBuffer: extendedMetadataJsonBuffer,
    },
  });

  // Make checksum of zip buffer
  const hash = crypto.createHash("sha256");
  hash.update(standardTransferZipBuffer);
  const standardTransferZipChecksum = hash.digest("hex");

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
