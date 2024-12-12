import type { Request, Response } from "express";
import { errorWrapper, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";
import { createTransferBodySchema } from "../schemas";
import { TransferService } from "@/modules/transfer/services";

// Create standard transfer.
export const create = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse, getZodValidatedBody, user } = req;
	const body = getZodValidatedBody(createTransferBodySchema); // Validate request body

	const jobID = `job-${Date.now()}`;

	// Save data for transfer
	await TransferService.updateTransferEntry(body.accession, body.application, {
		jobID,
		status: "Transferring",
	});

	// Add the job ID to the RabbitMQ queue
	//await addToStandardTransferQueue(jobID);

	const result = getStandardResponse({
		data: { jobID },
		message: "Job added to queue.",
		success: true,
	});

	res.status(HTTP_STATUS_CODES.CREATED).json(result);
});
