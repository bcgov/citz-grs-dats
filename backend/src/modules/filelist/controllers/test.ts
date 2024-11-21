import type { Request, Response } from "express";
import { errorWrapper, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";
import { type CreateFileListBody, createFileListBodySchema, type JsonFileList } from "../schemas";
import type { Workbook } from "exceljs";
import { createExcelWorkbook } from "../utils";
import { createJsonFileList } from "../utils";

export const test = errorWrapper(async (req: Request, res: Response) => {
	const { getStandardResponse, getZodValidatedBody } = req;
	const body: CreateFileListBody = getZodValidatedBody(createFileListBodySchema); // Validate request body

	// Format folder rows
	const folderRows = Object.entries(body.metadata.folders).map(([folder, metadata]) => ({
		folder, // Add the key as the "folder" property
		...metadata, // Spread the properties of the metadata
	}));

	// Format file rows
	const fileRows = Object.values(body.metadata.files).flat();

	// Handle output file type
	switch (body.outputFileType) {
		case "excel": {
			const fileName = `ARS662_File_List_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`;

			// Create Excel workbook
			const workbook: Workbook = createExcelWorkbook({
				folderRows,
				fileRows,
				accession: body.metadata?.admin?.accession,
				application: body.metadata?.admin?.application,
			});

			// Generate the Excel file as a buffer
			const buffer = await workbook.xlsx.writeBuffer();

			// Set response headers for file download
			res.set({
				"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"Content-Disposition": `attachment; filename="${fileName}"`,
				"Content-Length": buffer.byteLength,
			});

			// Send the buffer as the response
			return res.status(HTTP_STATUS_CODES.CREATED).send(buffer);
		}

		case "json": {
			const fileName = `ARS662_File_List_${new Date().toLocaleDateString().replace(/\//g, "-")}.json`;

			// Create JSON file list
			const jsonFile: JsonFileList = createJsonFileList({
				accession: body.metadata?.admin?.accession,
				application: body.metadata?.admin?.application,
				folders: body.metadata.folders,
				files: body.metadata.files,
			});

			// Generate JSON string and buffer
			const jsonBuffer = Buffer.from(JSON.stringify(jsonFile, null, 2));

			// Set response headers for file download
			res.set({
				"Content-Type": "application/json",
				"Content-Disposition": `attachment; filename="${fileName}"`,
				"Content-Length": jsonBuffer.byteLength,
			});

			// Send the buffer as the response
			return res.status(HTTP_STATUS_CODES.CREATED).send(jsonBuffer);
		}

		default: {
			const result = getStandardResponse({
				message: "Invalid output file type.",
				success: false,
			});
			return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json(result);
		}
	}
});
