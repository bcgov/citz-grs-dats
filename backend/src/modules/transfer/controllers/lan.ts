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

const { S3_BUCKET } = ENV;

type Files = {
  fileList?: { buffer: Express.Multer.File[] };
  transferForm?: { buffer: Express.Multer.File[] };
  folderBuffers?: { buffer: Express.Multer.File[] }[];
};

// Create lan transfer.
export const lan = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user, files } = req;
  const body = getZodValidatedBody(lanTransferBodySchema); // Validate request body

  let fileListBuffer = (files as Files)?.fileList?.buffer?.[0]?.buffer;
  const transferFormBuffer = (files as Files)?.transferForm?.buffer?.[0]
    ?.buffer;
  const accession = body.metadataV2.admin.accession;
  const application = body.metadataV2.admin.application;

  if (!fileListBuffer || !transferFormBuffer)
    throw new HttpError(
      HTTP_STATUS_CODES.BAD_REQUEST,
      "Missing fileListBuffer and/or transferFormBuffer."
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
    body.metadata.files
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

  // Metadata files
  const adminJsonBuffer = Buffer.from(
    JSON.stringify(body.metadataV2.admin),
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

  // Put together zip buffer

  // Make request to standard transfer

  const result = getStandardResponse({
    data: {
      user: `${user?.first_name} ${user?.last_name}`,
      accession,
      application,
    },
    message: "Transfer process started.",
    success: true,
  });

  res.status(HTTP_STATUS_CODES.CREATED).json(result);
});
