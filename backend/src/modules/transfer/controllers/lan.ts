import { application, type Request, type Response } from "express";
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
import ExcelJS from "exceljs";
import { addWorksheetToExistingWorkbookBuffer } from "@/modules/filelist/utils/excel";
import {
  setupFolderListV2,
  setupMetadata,
} from "@/modules/filelist/utils/excel/worksheets";

const { S3_BUCKET } = ENV;

type Files = {
  fileListBuffer?: Express.Multer.File[];
  transferFormBuffer?: Express.Multer.File[];
  folderBuffers?: Express.Multer.File[];
};

// Create lan transfer.
export const lan = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user, files } = req;
  const body = getZodValidatedBody(lanTransferBodySchema); // Validate request body
  let fileListBuffer = (files as Files)?.fileListBuffer?.[0]?.buffer;
  const transferFormBuffer = (files as Files)?.transferFormBuffer?.[0]?.buffer;

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

  // Update File List
  const workbook = new ExcelJS.Workbook();
  const folderListV2Worksheet = workbook.addWorksheet("FILE LIST V2");
  const metadataV2Worksheet = workbook.addWorksheet("METADATA V2");

  setupFolderListV2({
    worksheet: folderListV2Worksheet,
    folders: body.foldersMetadataOriginal,
    changes: body.changes,
  });
  setupMetadata({ worksheet: folderListV2Worksheet, files: body.filesV2 });

  fileListBuffer = (await addWorksheetToExistingWorkbookBuffer({
    buffer: fileListBuffer,
    worksheet: metadataV2Worksheet,
  })) as Buffer;

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
