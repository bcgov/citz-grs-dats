import type { Request, Response } from "express";
import { errorWrapper, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";
import { addToCreateFileListQueue } from "src/modules/rabbit/utils";
import { createFileListBodySchema } from "../schemas";
import type { FileListMongoose } from "../entity";
import { FileListService } from "../service";
import type { TransferMongoose } from "src/modules/transfer/entity";
import { TransferService } from "src/modules/transfer/service";

// Create file list.
export const create = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse, getZodValidatedBody, user } = req;
	const body = getZodValidatedBody(createFileListBodySchema); // Validate request body

	const jobID = `job-${Date.now()}`;

	// Save data for queue consumer to access later
	const fileListDatabaseEntry: FileListMongoose = {
		jobID,
		outputFileType: body.outputFileType,
		metadata: {
			admin: {
				application: body.metadata?.admin?.application ?? "N/A",
				accession: body.metadata?.admin?.accession ?? "N/A",
				submittedBy: {
					name: user?.display_name ?? "N/A",
					email: user?.email ?? "N/A",
				},
			},
			folders: body.metadata.folders,
			files: body.metadata.files,
		},
	};

	await FileListService.createFileListEntry(fileListDatabaseEntry);

	// Create transfer if application/accession numbers provided
	if (body.metadata?.admin?.application && body.metadata?.admin?.accession) {
		// Save data for transfer
		const transferDatabaseEntry: TransferMongoose = {
			metadata: {
				admin: {
					application: body.metadata?.admin?.application,
					accession: body.metadata?.admin?.accession,
					submittedBy: {
						name: user?.display_name ?? "",
						email: user?.email ?? "",
					},
				},
				folders: body.metadata.folders,
				files: body.metadata.files,
			},
		};

		await TransferService.createTransferEntry(transferDatabaseEntry);
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
