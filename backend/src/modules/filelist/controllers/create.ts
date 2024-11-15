import type { Request, Response } from "express";
import { errorWrapper } from "@bcgov/citz-imb-express-utilities";
import { addToCreateFileListQueue } from "src/modules/rabbit/utils";
import { createFileListBodySchema } from "../schemas";
import type { FileListMongoose } from "../entity";
import { FileListService } from "../service";

// Create file list.
export const create = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse, getZodValidatedBody, user } = req;
	const body = getZodValidatedBody(createFileListBodySchema); // Validate request body

	const jobID = `job-${Date.now()}`;

	// Save data for queue consumer to access later
	const fileListDatabasesEntry: FileListMongoose = {
		jobID,
		submittedBy: {
			name: user?.display_name ?? "",
			email: user?.email ?? "",
		},
		transfer: {
			application: body?.application ?? "N/A",
			accession: body?.accession ?? "N/A",
		},
		outputFileType: body.outputFileType,
		metadata: body.metadata,
	};

	await FileListService.createFileListEntry(fileListDatabasesEntry);

	// Save data for transfer
	const transferDatabaseEntry = {};

	// Add the job ID to the RabbitMQ queue
	await addToCreateFileListQueue(jobID);

	const result = getStandardResponse({
		data: { jobID },
		message: "Job added to queue.",
		success: true,
	});

	res.status(200).json(result);
});
