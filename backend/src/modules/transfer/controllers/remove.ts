import type { Request, Response } from "express";
import {
  errorWrapper,
  HTTP_STATUS_CODES,
} from "@bcgov/citz-imb-express-utilities";
import { removeTransferBodySchema } from "../schemas";
import { deleteFile } from "src/modules/s3/utils";
import { ENV } from "@/config";
import { TransferService } from "../services";
import { FileListService } from "@/modules/filelist/services";

const { S3_BUCKET } = ENV;

// Remove a transfer from mongo and s3.
export const remove = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user } = req;
  const body = getZodValidatedBody(removeTransferBodySchema); // Validate request body

  // Delete from s3
  await deleteFile({
    bucketName: S3_BUCKET,
    key: `transfers/TR_${body.accession}_${body.application}.zip`,
  });

  // Delete from mongo
  await TransferService.softDeleteTransferEntry(
    body.accession,
    body.application,
    user?.display_name ?? ""
  );
  await FileListService.deleteFileListByAccApp(
    body.accession,
    body.application
  );

  const result = getStandardResponse({
    data: {
      user: `${user?.first_name} ${user?.last_name}`,
      accession: body.accession,
      application: body.application,
    },
    message: "Transfer deleted.",
    success: true,
  });

  res.status(HTTP_STATUS_CODES.OK).json(result);
});
