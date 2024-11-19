import type { Worksheet } from "exceljs";
import type { FileMetadataZodType } from "../../schemas";

type Data = {
	worksheet: Worksheet;
	rows: FileMetadataZodType[];
};

const formatDate = (date: string): string => {
	if (date === "") return "";
	const parsedDate = new Date(date);
	if (Number.isNaN(parsedDate.getTime())) {
		return date; // Return the original value if it's not a valid date
	}
	const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
	const day = String(parsedDate.getDate()).padStart(2, "0");
	const year = parsedDate.getFullYear();
	return `${month}-${day}-${year}`;
};

export const addFileMetadata = ({ worksheet, rows }: Data) => {
	worksheet.columns = [
		{ width: 50 },
		{ width: 30 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 50 },
	];

	// Add column headers
	const headers = [
		"Path",
		"Name",
		"Size",
		"Created On",
		"Last Modified",
		"Last Accessed",
		"Checksum",
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
		from: "A1",
		to: "G1",
	};

	// Populate rows with data
	rows.forEach((row) => {
		worksheet.addRow([
			row.filepath,
			row.filename,
			row.size,
			formatDate(row.birthtime),
			formatDate(row.lastModified),
			formatDate(row.lastAccessed),
			row.checksum,
		]);
	});
};
