import type { Request, Response } from "express";
import {
  errorWrapper,
  HTTP_STATUS_CODES,
  HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { downloadTransferBodySchema } from "../schemas";
import { getDownloadUrl } from "src/modules/s3/utils";
import { ENV } from "@/config";
import { TransferService } from "../services";

const { S3_BUCKET } = ENV;

// Get a transfer download link.
export const download = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user } = req;
  const body = getZodValidatedBody(downloadTransferBodySchema); // Validate request body

  const s3Location = await getDownloadUrl({
    bucketName: S3_BUCKET,
    key: `transfers/TR_${body.accession}_${body.application}.zip`,
  });

  if (!s3Location || s3Location === "")
    throw new HttpError(
      HTTP_STATUS_CODES.NOT_FOUND,
      `Transfer with accession: ${body.accession}, application: ${body.application} not found in s3.`
    );

  // Update mongo record
  await TransferService.updateTransferEntry(body.accession, body.application, {
    status: "Downloaded",
  });

  const result = getStandardResponse({
    data: {
      user: `${user?.first_name} ${user?.last_name}`,
      accession: body.accession,
      application: body.application,
      url: s3Location,
    },
    message: "Returned download link.",
    success: true,
  });

  res.status(HTTP_STATUS_CODES.OK).json(result);
});
