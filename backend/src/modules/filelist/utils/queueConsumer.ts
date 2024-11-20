import type amqp from "amqplib";
import { FileListService } from "../services";
import { HTTP_STATUS_CODES, HttpError } from "@bcgov/citz-imb-express-utilities";
import type { JsonFileList } from "../schemas";
import { createJsonFileList } from "./createJsonFileList";
import type { Workbook } from "exceljs";
import { createExcelWorkbook } from "./excel";

const QUEUE_NAME = "CREATE_FILE_LIST_QUEUE";

export const queueConsumer = async (msg: amqp.ConsumeMessage, channel: amqp.Channel) => {
	const jobID = msg.content.toString();
	console.log(`[${QUEUE_NAME}] Processed job: ${jobID}`);

	// Get database record
	const filelist = await FileListService.getFileListByJobID(jobID);
	if (!filelist)
		throw new HttpError(HTTP_STATUS_CODES.NOT_FOUND, "filelist not found in queueConsumer.");

	// Delete database record
	await FileListService.deleteFileListByJobID(jobID);

	// Format folder rows
	const folderRows = Object.entries(filelist.metadata.folders).map(([folder, metadata]) => ({
		folder, // Add the key as the "folder" property
		...metadata, // Spread the properties of the metadata
	}));

	// Format file rows
	const fileRows = Object.values(filelist.metadata.files).flat();

	// Handle output file type
	switch (filelist.outputFileType) {
		case "excel": {
			const fileName = `ARS662_File_List_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`;

			// Create Excel workbook
			const workbook: Workbook = createExcelWorkbook({
				folderRows,
				fileRows,
				accession: filelist.metadata?.admin?.accession,
				application: filelist.metadata?.admin?.application,
			});

			// Generate the Excel file as a buffer
			const buffer = await workbook.xlsx.writeBuffer();

			// Send filelist via email
			return channel.ack(msg);
		}

		case "json": {
			const fileName = `ARS662_File_List_${new Date().toLocaleDateString().replace(/\//g, "-")}.json`;

			// Create JSON file list
			const jsonFile: JsonFileList = createJsonFileList({
				accession: filelist.metadata?.admin?.accession,
				application: filelist.metadata?.admin?.application,
				folders: filelist.metadata.folders,
				files: filelist.metadata.files,
			});

			// Generate JSON string and buffer
			const jsonBuffer = Buffer.from(JSON.stringify(jsonFile, null, 2));

			// Send filelist via email
			return channel.ack(msg);
		}

		default: {
			channel.ack(msg);
			throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Invalid output file type.");
		}
	}
};
