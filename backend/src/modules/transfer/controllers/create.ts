import type { Request, Response } from "express";
import { errorWrapper, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";
import { createTransferBodySchema } from "../schemas";
import { TransferService } from "src/modules/transfer/services";
import { upload } from "src/modules/s3/utils";
import { ENV } from "src/config";
import { formatDate } from "src/utils";
import { addToStandardTransferQueue } from "src/modules/rabbit/utils/queue/transfer";
import {
	getFileFromZipBuffer,
	getMetadata,
	validateDigitalFileList,
	validateMetadataFiles,
	validateStandardTransferStructure,
	validateSubmissionAgreement,
} from "../utils";
import type { TransferMongoose } from "../entities";

const { S3_BUCKET } = ENV;

// Create standard transfer.
export const create = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse, getZodValidatedBody, user } = req;
	const body = getZodValidatedBody(createTransferBodySchema); // Validate request body

	const jobID = `job-${Date.now()}`;

	// Validate transfer buffer
	validateStandardTransferStructure({ buffer: body.buffer });
	validateMetadataFiles({
		buffer: body.buffer,
		accession: body.accession,
		application: body.application,
	});

	const fileListBuffer = await getFileFromZipBuffer(body.buffer, "documentation/"); // TODO: get filename
	const submissionAgreementBuffer = await getFileFromZipBuffer(body.buffer, "documentation/");

	validateDigitalFileList({
		buffer: fileListBuffer,
		accession: body.accession,
		application: body.application,
	});
	validateSubmissionAgreement({
		buffer: submissionAgreementBuffer,
		accession: body.accession,
		application: body.application,
	});

	const metadata = await getMetadata(body.buffer);

	// Save data for transfer to Mongo
	await TransferService.updateTransferEntry(body.accession, body.application, {
		jobID,
		status: "Transferring",
		user,
		folders: metadata.folders as unknown as NonNullable<TransferMongoose["metadata"]>["folders"],
		files: metadata.files as unknown as NonNullable<TransferMongoose["metadata"]>["files"],
	});

	// Save to s3
	const s3Location = await upload({
		bucketName: S3_BUCKET,
		key: `transfers/TR_${body.accession}_${body.application}`,
		content: body.buffer,
	});

	// Add the job ID to the RabbitMQ queue
	await addToStandardTransferQueue(jobID);

	const result = getStandardResponse({
		data: {
			user: `${user?.first_name} ${user?.last_name}`,
			jobID,
			date: formatDate(new Date().toISOString()),
			accession: body.accession,
			application: body.application,
			fileLocation: s3Location,
		},
		message: "Job added to queue.",
		success: true,
	});

	res.status(HTTP_STATUS_CODES.CREATED).json(result);
});
