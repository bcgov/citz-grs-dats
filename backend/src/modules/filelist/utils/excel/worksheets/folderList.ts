import type { Worksheet } from "exceljs";
import type { FolderMetadataZodType } from "../../../schemas";
import { formatDate } from "src/utils";

type FolderRow = FolderMetadataZodType & { folder: string };

type Data = {
	worksheet: Worksheet;
	folders: FolderRow[];
};

export const setupFolderList = ({ worksheet, folders }: Data) => {
	// Set column widths
	worksheet.columns = [
		{ width: 40 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 40 },
		{ width: 20 },
		{ width: 20 },
		{ width: 35 },
		{ width: 30 },
	];

	// Add column headers
	const headers = [
		"* Folder",
		"* Schedule",
		"* Classification",
		"File ID",
		"* Office of Primary Responsibility (OPR) - (Y/N)",
		"* Start Date",
		"* End Date",
		"Superseded/Obsolete (SO) Date",
		"* Final Disposition (FD) Date",
	];
	const headerRow = worksheet.addRow(headers);

	// Style headers
	headerRow.eachCell((cell, colNumber) => {
		const headerText = headers[colNumber - 1]; // Get corresponding header text
		if (headerText.startsWith("*")) {
			// Apply richText formatting for headers starting with '*'
			cell.value = {
				richText: [
					{ text: "*", font: { color: { argb: "FFFF0000" }, name: "BC Sans", bold: true } }, // Red for '*'
					{ text: headerText.slice(1), font: { name: "BC Sans", bold: true } }, // Normal for the rest
				],
			};
		} else {
			cell.font = { name: "BC Sans", bold: true, color: { argb: "FF000000" } }; // Black text
		}
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
		to: "I1",
	};

	// Populate rows with data
	folders.forEach((row) => {
		const newRow = worksheet.addRow([
			row.folder,
			row.schedule,
			row.classification,
			row.file,
			row.opr ? "Y" : "N",
			formatDate(row.startDate),
			formatDate(row.endDate),
			formatDate(row.soDate),
			formatDate(row.fdDate),
		]);

		// Apply font styling to all cells in the row
		newRow.eachCell((cell) => {
			cell.font = { name: "BC Sans" };
		});
	});
};
