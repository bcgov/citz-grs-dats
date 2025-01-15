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
  let fileListBuffer = (files as Files)?.fileListBuffer;
  const transferFormBuffer = (files as Files)?.transferFormBuffer;

  // Create submission agreement file
  const subAgreementBuffer = await createAgreementPDF({
    ministrySignature: `${user?.first_name} ${user?.last_name}`,
    ministryDate: formatDate(new Date().toISOString()),
    accession: body.accession,
    application: body.application,
  });

  // Save submission agreement to s3
  await upload({
    bucketName: S3_BUCKET,
    key: `submission-agreements/${body.accession}_${body.application}.pdf`,
    content: subAgreementBuffer,
  });

  const result = getStandardResponse({
    data: {
      user: `${user?.first_name} ${user?.last_name}`,
      accession: body.accession,
      application: body.application,
    },
    message: "Transfer process started.",
    success: true,
  });

  res.status(HTTP_STATUS_CODES.CREATED).json(result);
});
