import type { Worksheet } from "exceljs";
import type { FileMetadataZodType } from "../../../schemas";
import { formatDate } from "src/utils";

type Data = {
	worksheet: Worksheet;
	files: FileMetadataZodType[];
};

export const setupMetadata = ({ worksheet, files }: Data) => {
	// Set column widths
	worksheet.columns = [
		{ width: 50 },
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
		"File Path",
		"File Name",
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
		to: "N1",
	};

	// Populate rows with data
	files.forEach((row) => {
		const newRow = worksheet.addRow([
			row.filepath,
			row.filename,
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
