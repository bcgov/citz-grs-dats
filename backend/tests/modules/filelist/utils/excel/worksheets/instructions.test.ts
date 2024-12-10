import { Workbook } from "exceljs";
import { setupInstructions } from "@/modules/filelist/utils/excel/worksheets";
import type { Worksheet } from "exceljs";

// Test suite for setupInstructions
describe("setupInstructions", () => {
	it("should set up the worksheet with the correct structure and styles", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("INSTRUCTIONS");

		setupInstructions({ worksheet });

		// Check column widths
		expect(worksheet.columns?.map((col) => col?.width)).toEqual([48, 145]);

		// Check header row
		const headerRow = worksheet.getRow(1);
		expect(headerRow.getCell(1).value).toBe("Instructions");
		expect(headerRow.getCell(1).font).toEqual(
			expect.objectContaining({ name: "BC Sans", bold: true }),
		);
		expect(headerRow.getCell(1).alignment).toEqual({
			horizontal: "center",
			vertical: "middle",
		});

		// Check header background fill
		expect(headerRow.getCell(1).fill).toEqual({
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFC1DDFC" },
		});

		// Check merged cells for header
		expect(worksheet.getCell("A1").value).toBe("Instructions");
		expect(worksheet.getCell("B1").value).toBe("Instructions");

		// Check instruction rows
		const expectedInstructionRows = [
			[
				"Complete this document by filling out the required fields marked by '*' on the 'COVER PAGE' and 'FILE LIST' sheets.",
			],
			["For more information, please reference the legend and link to documentation below."],
			[""],
			[
				"Records Management: ",
				"https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management",
			],
			[""],
		];

		expectedInstructionRows.forEach((row, index) => {
			const rowIndex = index + 2; // Data rows start at index 2
			const newRow = worksheet.getRow(rowIndex);

			newRow.eachCell((cell, colIndex) => {
				expect(cell.font).toEqual(expect.objectContaining({ name: "BC Sans" }));
				if (index > 1 && colIndex === 1) {
					expect(cell.font).toEqual(expect.objectContaining({ name: "BC Sans", bold: true }));
				}
			});

			if (index === expectedInstructionRows.length - 2) {
				const hyperlinkCell = newRow.getCell(2);
				expect(hyperlinkCell.value).toEqual({
					text: "Click here for Records Management documentation.",
					hyperlink: row[1],
				});
				expect(hyperlinkCell.font).toEqual({
					name: "BC Sans",
					underline: true,
					color: { argb: "FF0000FF" },
				});
			}
		});

		// Check legend header row
		const legendHeaderRow = worksheet.getRow(7);
		expect(legendHeaderRow.getCell(1).value).toBe("Legend");
		expect(legendHeaderRow.getCell(1).font).toEqual(
			expect.objectContaining({ name: "BC Sans", bold: true }),
		);
		expect(legendHeaderRow.getCell(1).alignment).toEqual({
			horizontal: "center",
			vertical: "middle",
		});
		expect(legendHeaderRow.getCell(1).fill).toEqual({
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFC1DDFC" },
		});

		// Check legend rows
		const expectedLegendRows = [
			["Folder:", "File path to the folder."],
			["Schedule:", "Information Schedule number (e.g. 100001 for ARCS)."],
			["Classification:", "Classification number (e.g. 201-40 for Cabinet Submissions)."],
			[
				"File ID:",
				"File identifier to link multiple folders, if used (e.g. PEP for Provincial Emergency Program).",
			],
			[
				"Office of Primary Responsibility (OPR) - (Y/N):",
				"Office of Primary Responsibility (OPR) maintains the official copy of the records.",
			],
			["Start Date:", "Date the file was opened."],
			["End Date:", "Date the file was closed."],
			[
				"Superseded/Obsolete (SO) Date:",
				"Date the file became Superseded or Obsolete (SO), if applicable.",
			],
			["Final Disposition (FD) Date:", "Date the file was eligible for Final Disposition (FD)."],
		];

		expectedLegendRows.forEach((row, index) => {
			const rowIndex = index + 8; // Legend rows start at index 7
			const newRow = worksheet.getRow(rowIndex);

			const firstCell = newRow.getCell(1);
			const secondCell = newRow.getCell(2);

			// Check first column (bold styling)
			expect(firstCell.value).toBe(row[0]);
			expect(firstCell.font).toEqual(expect.objectContaining({ name: "BC Sans", bold: true }));

			// Check second column (normal styling)
			expect(secondCell.value).toBe(row[1]);
			expect(secondCell.font).toEqual(expect.objectContaining({ name: "BC Sans" }));
		});
	});
});
