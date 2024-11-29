import type { Request, Response } from "express";
import { errorWrapper, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";
import { createSubmissionAgreementBodySchema } from "../schemas";
import { createAgreementPDF } from "../utils";
import { formatDate } from "src/utils";

// Create/accept submission agreement.
export const create = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse, getZodValidatedBody, user } = req;
	const body = getZodValidatedBody(createSubmissionAgreementBodySchema); // Validate request body

	// Create file
	const pdfBuffer = await createAgreementPDF({
		ministrySignature: `${user?.first_name} ${user?.last_name}`,
		ministryDate: formatDate(new Date().toISOString()),
		accession: body.accession,
		application: body.application,
	});

	// Save to s3
	// TODO: Requires ticket DAP-1017

	const result = getStandardResponse({
		data: {
			signee: `${user?.first_name} ${user?.last_name}`,
			date: formatDate(new Date().toISOString()),
			accession: body.accession,
			application: body.application,
		},
		message: "Submission agreement created/accepted.",
		success: true,
	});

	res.status(HTTP_STATUS_CODES.CREATED).json(result);
});
