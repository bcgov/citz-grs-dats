import type { Request, Response } from "express";
import {
  errorWrapper,
  HTTP_STATUS_CODES,
} from "@bcgov/citz-imb-express-utilities";
import { sendEmail } from "@/modules/ches/utils";
import { declineAgreementEmail } from "../utils";
import { declineSubmissionAgreementBodySchema } from "../schemas";

// Decline submission agreement
export const decline = errorWrapper(async (req: Request, res: Response) => {
  const { getStandardResponse, getZodValidatedBody, user } = req;
  const body = getZodValidatedBody(declineSubmissionAgreementBodySchema); // Validate request body

  // Send GIM email
  sendEmail({
    bodyType: "html",
    body: declineAgreementEmail(
      user?.display_name ?? "",
      user?.email ?? "",
      body.accession,
      body.application
    ),
    to: ["GIM@gov.bc.ca"],
    subject: "DATS - User Declined Submission Agreement",
  });

  const result = getStandardResponse({
    data: {
      signee: `${user?.first_name} ${user?.last_name}`,
      accession: body.accession,
      application: body.application,
    },
    message: "Submission agreement decline sent to GIM branch.",
    success: true,
  });

  res.status(HTTP_STATUS_CODES.CREATED).json(result);
});
