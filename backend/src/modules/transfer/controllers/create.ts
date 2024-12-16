import type { Request, Response } from "express";
import { errorWrapper, HTTP_STATUS_CODES, HttpError } from "@bcgov/citz-imb-express-utilities";
import { createTransferBodySchema } from "../schemas";
import { TransferService } from "src/modules/transfer/services";
import { download, upload } from "src/modules/s3/utils";
import { ENV } from "src/config";
import { streamToBuffer } from "src/utils";
import { addToStandardTransferQueue } from "src/modules/rabbit/utils/queue/transfer";
import {
	addFileToZipBuffer,
	getFileFromZipBuffer,
	getFilenameByRegex,
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
	const { getStandardResponse, getZodValidatedBody, user, file } = req;
	const body = getZodValidatedBody(createTransferBodySchema); // Validate request body
	let buffer = file?.buffer;

	if (!buffer) throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Missing buffer.");

	const jobID = `job-${Date.now()}`;

	let subAgreementPath = await getFilenameByRegex({
		buffer,
		directory: "documentation/",
		regex: /^Submission_Agreement/,
	});

	if (!subAgreementPath) {
		const subAgreementStream = await download({
			bucketName: S3_BUCKET,
			key: `submission-agreements/${body.accession}_${body.application}.pdf`,
		});
		if (!subAgreementStream)
			throw new HttpError(
				HTTP_STATUS_CODES.NOT_FOUND,
				"Submission Agreement (beginning with 'Submission_Agreement') must be included and have a .pdf extension in the documentation directory.",
			);
		const s3SubAgreementBuffer = await streamToBuffer(subAgreementStream);
		const newSubAgreementName = `Submission_Agreement_${body.accession}_${body.application}.pdf`;
		subAgreementPath = `documentation\\${newSubAgreementName}`;

		// Add agreement to zip buffer
		buffer = await addFileToZipBuffer({
			zipBuffer: buffer,
			fileBuffer: s3SubAgreementBuffer,
			filePath: subAgreementPath,
		});
	}

	// Validate transfer buffer
	validateStandardTransferStructure({ buffer });
	validateMetadataFiles({
		buffer,
		accession: body.accession,
		application: body.application,
	});

	const fileListPath = await getFilenameByRegex({
		buffer,
		directory: "documentation/",
		regex: /^(Digital_File_List|File\sList)/,
	});

	// biome-ignore lint/style/noNonNullAssertion: Verified by validateStandardTransferStructure
	const fileListBuffer = await getFileFromZipBuffer(buffer, fileListPath!);
	// biome-ignore lint/style/noNonNullAssertion: Verified by validateStandardTransferStructure
	const submissionAgreementBuffer = await getFileFromZipBuffer(buffer, subAgreementPath!);

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

	const metadata = await getMetadata(buffer);

	// Save data for transfer to Mongo
	await TransferService.createOrUpdateTransferEntry({
		accession: body.accession,
		application: body.application,
		jobID,
		status: "Transferring",
		user,
		folders: metadata.folders as unknown as NonNullable<TransferMongoose["metadata"]>["folders"],
		files: metadata.files as unknown as NonNullable<TransferMongoose["metadata"]>["files"],
	});

	// Save to s3
	const s3Location = await upload({
		bucketName: S3_BUCKET,
		key: `transfers/TR_${body.accession}_${body.application}.zip`,
		content: buffer,
	});

	// Add the job ID to the RabbitMQ queue
	await addToStandardTransferQueue(jobID);

	const result = getStandardResponse({
		data: {
			user: `${user?.first_name} ${user?.last_name}`,
			jobID,
			accession: body.accession,
			application: body.application,
			fileLocation: s3Location,
		},
		message: "Job added to queue.",
		success: true,
	});

	res.status(HTTP_STATUS_CODES.CREATED).json(result);
});
