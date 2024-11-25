import { Workbook } from "exceljs";
import { setupInstructions } from "@/modules/filelist/utils/excel/worksheets";
import type { Worksheet } from "exceljs";

describe("setupInstructions", () => {
	it("should set up the worksheet with the correct structure and styles", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("INSTRUCTIONS");

		setupInstructions({ worksheet });

		// Check column widths
		expect(worksheet.columns?.map((col) => col?.width)).toEqual([30, 170]);

		// Check header row
		const headerRow = worksheet.getRow(1);
		expect(headerRow.getCell(1).value).toBe("Instructions");
		expect(worksheet.getCell("A1").font).toEqual({ bold: true });
		expect(worksheet.getCell("A1").alignment).toEqual({
			horizontal: "center",
			vertical: "middle",
		});

		// Check header background fill
		expect(worksheet.getCell("A1").fill).toEqual({
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFD6F2B3" },
		});

		// Check merged cells
		expect(worksheet.getCell("A1").value).toBe("Instructions");
		expect(worksheet.getCell("B1").value).toBe("Instructions");

		// Check instruction rows
		const expectedRows = [
			["Folder:", "File path to the folder."],
			["Schedule:", "Information Schedule number (e.g. 100001 for ARCS)."],
			["Classification:", "Classification number (e.g. 201-40 for Cabinet Submissions)."],
			[
				"File ID:",
				"File identifier to link multiple folders, if used (e.g. PEP for Provincial Emergency Program).",
			],
			[
				"OPR (Y/N):",
				"Office of Primary Responsibility (OPR) maintains the official copy of the records.",
			],
			["Start Date:", "Date the file was opened."],
			["End Date:", "Date the file was closed."],
			["SO Date:", "Date the file became Superseded or Obsolete (SO), if applicable."],
			["FD Date:", "Date the file was eligible for Final Disposition (FD)."],
			["", ""],
			[
				"Information Schedules:",
				"https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/information-schedules",
			],
		];

		expectedRows.forEach((expectedRow, index) => {
			const rowIndex = index + 2; // Data rows start at index 2
			const row = worksheet.getRow(rowIndex);

			expect(row.getCell(1).value).toBe(expectedRow[0]);
			expect(row.getCell(1).font).toEqual({
				bold: true,
				color: { argb: "FF000080" },
			});

			if (index === expectedRows.length - 1) {
				// Check hyperlink row
				const hyperlinkCell = row.getCell(2);
				expect(hyperlinkCell.value).toEqual({
					text: "Click here for Information Schedules.",
					hyperlink: expectedRow[1],
				});
				expect(hyperlinkCell.font).toEqual({
					underline: true,
					color: { argb: "FF0000FF" },
				});
			} else if (expectedRow[1]) {
				expect(row.getCell(2).value).toBe(expectedRow[1]);
			}
		});
	});
});
