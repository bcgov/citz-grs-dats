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
	const headerRow = worksheet.addRow(["Cover Page"]);
	worksheet.mergeCells("A1:B1");

	// Style the header text
	headerRow.font = { bold: true };
	headerRow.eachCell((cell) => {
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFD6F2B3" }, // Background
		};
	});
	headerRow.alignment = { horizontal: "center", vertical: "middle" };

	// Add data
	const rows = [
		["ARS662 Last Revised:"],
		["Ministry:"],
		["Branch:"],
		["Accession #:", accession === null ? "" : accession],
		["Application #:", application === null ? "" : application],
	];

	rows.forEach((row) => {
		const newRow = worksheet.addRow(row);
		// Make the first column bold and blue
		newRow.getCell(1).font = { bold: true, color: { argb: "FF000080" } };
	});

	// Set last revised date
	worksheet.getCell("B2").value = {
		formula: 'TEXT(TODAY(), "MM-DD-YYYY")',
	};
};
