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
import { callTransferEndpoint, createStandardTransferZip } from "../utils";
import crypto from "node:crypto";
import { TransferService } from "../services";

const { S3_BUCKET } = ENV;

// Create lan transfer.
export const lan = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user, token, files } = req;
  const body = getZodValidatedBody(lanTransferBodySchema); // Validate request body

  let fileListBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "fileListBuffer"
  )?.buffer;
  const transferFormBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "transferFormBuffer"
  )?.buffer;
  const contentZipBuffer = (files as Express.Multer.File[])?.find(
    (file) => file.fieldname === "contentZipBuffer"
  )?.buffer;

  const accession = body.metadataV2.admin.accession;
  const application = body.metadataV2.admin.application;

  if (!fileListBuffer || !transferFormBuffer || !contentZipBuffer)
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
  const folderRows = Object.entries(body.metadataV2.folders).map(
    ([folder, metadata]) => ({
      folder, // Add the key as the "folder" property
      ...(metadata as unknown[]), // Spread the properties of the metadata
    })
  ) as FolderRow[];

  // Format file rows
  const fileRows = Object.values(
    body.metadataV2.files
  ).flat() as FileMetadataZodType[];

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

  // Get original extended metadata
  const transferEntry = await TransferService.getTransferWhere({
    accession,
    application,
  });
  const originalExtendedMetadataJson = transferEntry?.extendedMetadata ?? {};

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
