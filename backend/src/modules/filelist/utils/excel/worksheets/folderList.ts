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
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
	];

	// Add column headers
	const headers = [
		"Folder",
		"Schedule",
		"Classification",
		"File ID",
		"OPR (Y/N)",
		"Start Date",
		"End Date",
		"SO Date",
		"FD Date",
	];
	const headerRow = worksheet.addRow(headers);

	// Style headers
	headerRow.eachCell((cell) => {
		cell.font = { bold: true, color: { argb: "FF000000" } }; // Black text
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFD6F2B3" }, // Background
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
		worksheet.addRow([
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
	});
};
