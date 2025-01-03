import type { Worksheet } from "exceljs";
import type { FileMetadataZodType } from "../../../schemas";
import { formatDate } from "src/utils";

type Data = {
	worksheet: Worksheet;
	files: FileMetadataZodType[];
	changes: {
		originalFilePath: string;
		newFilePath?: string;
		deleted: boolean;
	}[];
};

export const setupMetadataV2 = ({ worksheet, files, changes }: Data) => {
	// Set column widths
	worksheet.columns = [
		{ width: 50 },
		{ width: 50 },
		{ width: 30 },
		{ width: 30 },
		{ width: 20 },
		{ width: 50 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
	];

	// Add column headers
	const headers = [
		"Original File Path",
		"New File Path",
		"File Name",
		"Change",
		"Size",
		"Checksum",
		"Created On",
		"Last Modified",
		"Last Accessed",
		"Last Saved",
		"Authors",
		"Owner",
		"Company",
		"Computer",
		"Content-Type",
		"Program Name",
	];
	const headerRow = worksheet.addRow(headers);

	// Style headers
	headerRow.eachCell((cell) => {
		cell.font = { name: "BC Sans", bold: true, color: { argb: "FF000000" } }; // Black text with 'BC Sans'
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFC1DDFC" }, // Background
		};
		cell.alignment = { horizontal: "left" }; // Align to the left
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	});

	// Enable sorting for the table headers
	worksheet.autoFilter = {
		from: "A1",
		to: "P1",
	};

	// Populate rows with data
	files.forEach((row) => {
		const change = changes.find((folder) => folder.originalFilePath === row.filepath);

		const newRow = worksheet.addRow([
			row.filepath,
			change?.newFilePath ?? "",
			row.filename,
			change?.deleted ? "Deleted" : change?.newFilePath ? "Path Changed" : "Unchanged",
			row.size,
			row.checksum,
			formatDate(row.birthtime),
			formatDate(row.lastModified),
			formatDate(row.lastAccessed),
			row?.lastSaved ? formatDate(row.lastSaved) : "",
			row?.authors ?? "",
			row?.owner ?? "",
			row?.company ?? "",
			row?.computer ?? "",
			row?.contentType ?? "",
			row?.programName ?? "",
		]);

		// Apply font styling to all cells in the row
		newRow.eachCell((cell) => {
			cell.font = { name: "BC Sans" }; // Apply 'BC Sans' to data cells
		});
	});
};
