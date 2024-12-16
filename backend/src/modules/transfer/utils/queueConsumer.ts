import { TRANSFER_QUEUE_NAME as QUEUE_NAME } from "src/modules/rabbit/utils/queue/transfer";
import type amqp from "amqplib";
import { TransferService } from "../services";
import { formatDate, streamToBuffer } from "src/utils";
import { download, upload } from "src/modules/s3/utils";
import { ENV } from "src/config";
import { getFileFromZipBuffer } from "./getFileFromZipBuffer";
import { sendEmail } from "src/modules/ches/utils";
import { transferEmail } from "./email";
import { sortPSPContent } from "./sortPSPContent";
import type { TransferZod } from "../entities";
import { createPSP } from "./createPSP";
import type { AdminMetadataZodType } from "../schemas";
import { getFilenameByRegex } from "./getFilenameByRegex";
import { createFinalTransfer } from "./createFinalTransfer";

const { S3_BUCKET } = ENV;

export const queueConsumer = async (msg: amqp.ConsumeMessage, channel: amqp.Channel) => {
	const jobID = msg.content.toString();
	console.log(`[${QUEUE_NAME}] Processed job: ${jobID}`);

	// Get database record
	const transfer = await TransferService.getTransferWhere({ jobID: jobID });
	if (!transfer) {
		channel.ack(msg);
		return console.error("transfer not found in queueConsumer.");
	}

	if (!transfer.metadata) {
		channel.ack(msg);
		return console.error("transfer metadata not found in queueConsumer.");
	}

	const metadata = JSON.parse(JSON.stringify(transfer.metadata));

	const accession = metadata.admin?.accession ?? "";
	const application = metadata.admin?.application ?? "";
	const date = formatDate(new Date().toISOString());

	const file_list_filename = `Digital_File_List_${date}_${accession}_${application}.xlsx`;
	const submission_agreement_filename = `Submission_Agreement_${date}_${accession}_${application}.pdf`;

	// Get transfer from s3
	const stream = await download({
		bucketName: S3_BUCKET,
		key: `transfers/TR_${accession}_${application}.zip`,
	});
	const buffer = await streamToBuffer(stream);

	// Process transfer
	const pspContent = sortPSPContent(
		metadata.folders as unknown as TransferZod["metadata"]["folders"],
	);
	const pspBuffers: {
		buffer: Buffer;
		schedule: string;
		classification: string;
	}[] = [];

	for (const psp of pspContent) {
		const pspBuffer = await createPSP({
			folderContent: psp.content,
			buffer,
			metadata: metadata as unknown as {
				admin: AdminMetadataZodType | TransferZod["metadata"]["admin"];
				folders: TransferZod["metadata"]["folders"];
				files: TransferZod["metadata"]["files"];
			},
		});
		pspBuffers.push({
			buffer: pspBuffer,
			schedule: psp.schedule,
			classification: psp.classification,
		});
	}

	const newTransferBuffer = await createFinalTransfer(pspBuffers);

	// Save to s3
	await upload({
		bucketName: S3_BUCKET,
		key: `transfers/TR_${accession}_${application}.zip`,
		content: newTransferBuffer,
	});

	// Get transfer files for email attachment
	const fileListPath = await getFilenameByRegex({
		buffer,
		directory: "documentation/",
		regex: /^(Digital_File_List|File\sList)/,
	});

	const subAgreementPath = await getFilenameByRegex({
		buffer,
		directory: "documentation/",
		regex: /^Submission_Agreement/,
	});

	// biome-ignore lint/style/noNonNullAssertion: Verified by validateStandardTransferStructure
	const fileListBuffer = await getFileFromZipBuffer(buffer, fileListPath!);
	// biome-ignore lint/style/noNonNullAssertion: Verified by validateStandardTransferStructure
	const submissionAgreementBuffer = await getFileFromZipBuffer(buffer, subAgreementPath!);

	// Convert the buffer to Base64 for email attachment
	const fileListBase64Buffer = Buffer.from(fileListBuffer).toString("base64");
	const subAgreementBase64Buffer = Buffer.from(submissionAgreementBuffer).toString("base64");

	const email = metadata.admin?.submittedBy?.email;
	if (!email) {
		channel.ack(msg);
		return console.error("Email not found in transfer.");
	}

	// Send completion email
	sendEmail({
		attachments: [
			{
				filename: file_list_filename,
				content: fileListBase64Buffer,
				contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				encoding: "base64",
			},
			{
				filename: submission_agreement_filename,
				content: subAgreementBase64Buffer,
				contentType: "application/pdf",
				encoding: "base64",
			},
		],
		bodyType: "html",
		body: transferEmail(accession, application),
		to: [email],
		subject: "DATS - Records Sent to Digital Archives",
	});

	console.log(`Completed transfer of TR_${accession}_${application}`);
	return channel.ack(msg);
};
