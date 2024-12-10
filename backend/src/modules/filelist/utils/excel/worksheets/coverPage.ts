import { formatDate } from "src/utils";
import type { Worksheet } from "exceljs";

type Data = {
	worksheet: Worksheet;
	accession?: string | null | undefined;
	application?: string | null | undefined;
};

export const setupCoverPage = ({ worksheet, accession = "", application = "" }: Data) => {
	// Set column widths
	worksheet.columns = [{ width: 30 }, { width: 170 }];

	// Add header text and merge the first two columns
	const headerRow = worksheet.addRow(["Description", "Value"]);

	// Style the header text
	headerRow.eachCell((cell) => {
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFC1DDFC" }, // Background
		};
		cell.font = {
			name: "BC Sans", // Set font to 'BC Sans'
			bold: true, // Make header bold
		};
	});

	// Add data rows
	const rows = [
		["* ARS662 Last Revised Date:", formatDate(new Date().toISOString())],
		["* Accession #:", accession === null ? "" : accession],
		["* Application #:", application === null ? "" : application],
	];

	rows.forEach((row) => {
		const newRow = worksheet.addRow(row);

		// Apply rich text formatting to the first cell
		const firstCell = newRow.getCell(1);
		const text = row[0];
		if (text) {
			firstCell.value = {
				richText: [
					{ text: text[0], font: { color: { argb: "FFFF0000" }, bold: true } }, // Red for the first character
					{ text: text.slice(1), font: { name: "BC Sans", bold: true } }, // Normal for the rest with 'BC Sans'
				],
			};
		}

		// Style the first column's font
		firstCell.font = {
			name: "BC Sans", // Set font to 'BC Sans'
			bold: true,
		};

		// Style the second column's font
		newRow.getCell(2).font = {
			name: "BC Sans", // Set font to 'BC Sans'
		};
	});
};
