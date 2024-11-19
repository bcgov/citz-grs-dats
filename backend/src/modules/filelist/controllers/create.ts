import type { Request, Response } from "express";
import { errorWrapper, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";
import { addToCreateFileListQueue } from "src/modules/rabbit/utils";
import { createFileListBodySchema } from "../schemas";
import { FileListService } from "../services";
import { TransferService } from "@/modules/transfer/services";

// Create file list.
export const create = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse, getZodValidatedBody, user } = req;
	const body = getZodValidatedBody(createFileListBodySchema); // Validate request body

	const jobID = `job-${Date.now()}`;

	// Save data for queue consumer to access later
	await FileListService.createFileListEntry({
		jobID,
		user,
		application: body.metadata?.admin?.application ?? "N/A",
		accession: body.metadata?.admin?.accession ?? "N/A",
		outputFileType: body.outputFileType,
		folders: body.metadata.folders,
		files: body.metadata.files,
	});

	// Create transfer if application/accession numbers provided
	if (body.metadata?.admin?.application && body.metadata?.admin?.accession) {
		// Save data for transfer
		await TransferService.createOrUpdateTransferEntry({
			user,
			application: body.metadata?.admin?.application ?? "N/A",
			accession: body.metadata?.admin?.accession ?? "N/A",
			folders: body.metadata.folders,
			files: body.metadata.files,
		});
	}

	// Add the job ID to the RabbitMQ queue
	await addToCreateFileListQueue(jobID);

	const result = getStandardResponse({
		data: { jobID },
		message: "Job added to queue.",
		success: true,
	});

	res.status(HTTP_STATUS_CODES.CREATED).json(result);
});
