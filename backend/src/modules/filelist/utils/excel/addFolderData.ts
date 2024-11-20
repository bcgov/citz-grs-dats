import type { Worksheet } from "exceljs";
import type { FolderMetadataZodType } from "../../schemas";
import { formatDate } from "src/utils";

type FolderRow = FolderMetadataZodType & { folder: string };

type Data = {
	worksheet: Worksheet;
	rows: FolderRow[];
};

export const addFolderData = ({ worksheet, rows }: Data) => {
	// Add column headers
	const headers = [
		"Folder",
		"Schedule",
		"Primary/Secondary",
		"FILE ID",
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

	// Enable sorting for the table
	worksheet.autoFilter = {
		from: "A3",
		to: "I3",
	};

	// Populate rows with data
	rows.forEach((row) => {
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
