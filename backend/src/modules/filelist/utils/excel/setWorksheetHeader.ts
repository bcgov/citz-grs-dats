import type { Worksheet } from "exceljs";

type Data = {
	worksheet: Worksheet;
	accession?: string | null | undefined;
	application?: string | null | undefined;
};

export const setWorksheetHeader = ({ worksheet, accession = "", application = "" }: Data) => {
	// Add the first row with revision date
	const headerRow = worksheet.addRow(["ARS662 Last Revised:"]);
	worksheet.getCell("B1").value = {
		formula: 'TEXT(TODAY(), "MM-DD-YYYY")',
	};

	// Style the first row
	headerRow.font = { bold: true, color: { argb: "FF000080" } }; // Dark blue
	worksheet.getCell("B1").font = { bold: true, color: { argb: "FF000080" } };

	// Add the second row with ministry details
	worksheet.addRow([
		"MINISTRY: ",
		"BRANCH: ",
		"",
		`ACCESSION #: ${accession === null ? "" : accession}`,
		"",
		`APPLICATION #: ${application === null ? "" : application}`,
		"",
	]);

	// Merge cells to span two columns for each value
	worksheet.mergeCells("B2:C2"); // BRANCH
	worksheet.mergeCells("D2:E2"); // ACCESSION
	worksheet.mergeCells("F2:G2"); // APPLICATION

	// Style the second row
	const secondRow = worksheet.getRow(2);
	secondRow.font = { bold: true, color: { argb: "FF000080" } }; // Dark blue
};
