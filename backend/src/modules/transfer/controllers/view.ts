import type { Request, Response } from "express";
import {
  errorWrapper,
  HTTP_STATUS_CODES,
} from "@bcgov/citz-imb-express-utilities";
import { TransferService } from "src/modules/transfer/services";

// Get all completed transfers.
export const view = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, user } = req;

  const transfers = await TransferService.getCompletedTransfers();

  const result = getStandardResponse({
    data: {
      user: `${user?.first_name} ${user?.last_name}`,
      transfers,
    },
    message: "Returned completed transfers.",
    success: true,
  });

  res.status(HTTP_STATUS_CODES.OK).json(result);
});
