import { Workbook } from "exceljs";
import { setupCoverPage } from "@/modules/filelist/utils/excel/worksheets";
import type { Worksheet } from "exceljs";

describe("setupCoverPage", () => {
	it("should set up the worksheet with the correct structure and styles", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("COVER PAGE");

		const accession = "123";
		const application = "123";

		setupCoverPage({ worksheet, accession, application });

		// Check column widths
		expect(worksheet.columns?.map((col) => col?.width)).toEqual([30, 170]);

		// Check header row
		const headerRow = worksheet.getRow(1);
		expect(headerRow.getCell(1).value).toBe("Cover Page");
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
		expect(worksheet.getCell("A1").value).toBe("Cover Page");
		expect(worksheet.getCell("B1").value).toBe("Cover Page"); // Merged cell retains the same value

		// Check data rows
		const expectedRows = [
			["ARS662 Last Revised:"],
			["Ministry:"],
			["Branch:"],
			["Accession #:", accession],
			["Application #:", application],
		];

		expectedRows.forEach((expectedRow, index) => {
			const rowIndex = index + 2; // Data rows start at index 2
			const row = worksheet.getRow(rowIndex);

			expect(row.getCell(1).value).toBe(expectedRow[0]);
			expect(row.getCell(1).font).toEqual({ bold: true, color: { argb: "FF000080" } });
			if (expectedRow[1] !== undefined) {
				expect(row.getCell(2).value).toBe(expectedRow[1]);
			}
		});

		// Check formula for "Last Revised" date
		expect(worksheet.getCell("B2").value).toEqual({
			formula: 'TEXT(TODAY(), "MM-DD-YYYY")',
		});
	});

	it("should handle default values for accession and application when not provided", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("COVER PAGE");

		setupCoverPage({ worksheet });

		const rowAccession = worksheet.getRow(5);
		expect(rowAccession.getCell(2).value).toBe("");

		const rowApplication = worksheet.getRow(6);
		expect(rowApplication.getCell(2).value).toBe("");
	});

	it("should handle null values for accession and application as empty strings", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("COVER PAGE");

		setupCoverPage({ worksheet, accession: null, application: null });

		const expectedRows = [
			["ARS662 Last Revised:"],
			["Ministry:"],
			["Branch:"],
			["Accession #:", ""],
			["Application #:", ""],
		];

		expectedRows.forEach((expectedRow, index) => {
			const rowIndex = index + 2; // Data rows start at index 2
			const row = worksheet.getRow(rowIndex);

			expect(row.getCell(1).value).toBe(expectedRow[0]);
			expect(row.getCell(1).font).toEqual({ bold: true, color: { argb: "FF000080" } });
			if (expectedRow[1] !== undefined) {
				expect(row.getCell(2).value).toBe(expectedRow[1]);
			}
		});
	});
});
