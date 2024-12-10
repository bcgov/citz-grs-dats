import { Workbook } from "exceljs";
import { setupCoverPage } from "@/modules/filelist/utils/excel/worksheets";
import { formatDate } from "src/utils";
import type { Worksheet } from "exceljs";

// Test suite for setupCoverPage
describe("setupCoverPage", () => {
	it("should set up the worksheet with the correct structure and styles", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("COVER PAGE");

		const accession = "123";
		const application = "456";

		setupCoverPage({ worksheet, accession, application });

		// Check column widths
		expect(worksheet.columns?.map((col) => col?.width)).toEqual([30, 170]);

		// Check header row
		const headerRow = worksheet.getRow(1);
		expect(headerRow.getCell(1).value).toBe("Description");
		expect(headerRow.getCell(2).value).toBe("Value");

		headerRow.eachCell((cell) => {
			expect(cell.font).toEqual({ name: "BC Sans", bold: true });
			expect(cell.fill).toEqual({
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFC1DDFC" },
			});
		});

		// Check data rows
		const expectedRows = [
			["* ARS662 Last Revised Date:", formatDate(new Date().toISOString())],
			["* Accession #:", accession],
			["* Application #:", application],
		];

		expectedRows.forEach((expectedRow, index) => {
			const rowIndex = index + 2; // Data rows start at index 2
			const row = worksheet.getRow(rowIndex);

			const firstCell = row.getCell(1);
			const secondCell = row.getCell(2);

			// Check first cell rich text formatting
			expect(firstCell.value).toEqual({
				richText: [
					{ text: expectedRow[0][0], font: { color: { argb: "FFFF0000" }, bold: true } },
					{ text: expectedRow[0].slice(1), font: { name: "BC Sans", bold: true } },
				],
			});

			// Check second cell value and font
			expect(secondCell.value).toBe(expectedRow[1]);
			expect(secondCell.font).toEqual({ name: "BC Sans" });
		});
	});

	it("should handle default values for accession and application when not provided", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("COVER PAGE");

		setupCoverPage({ worksheet });

		const expectedRows = [
			["* ARS662 Last Revised Date:", formatDate(new Date().toISOString())],
			["* Accession #:", ""],
			["* Application #:", ""],
		];

		expectedRows.forEach((expectedRow, index) => {
			const rowIndex = index + 2;
			const row = worksheet.getRow(rowIndex);

			const firstCell = row.getCell(1);
			const secondCell = row.getCell(2);

			expect(firstCell.value).toEqual({
				richText: [
					{ text: expectedRow[0][0], font: { color: { argb: "FFFF0000" }, bold: true } },
					{ text: expectedRow[0].slice(1), font: { name: "BC Sans", bold: true } },
				],
			});

			expect(secondCell.value).toBe(expectedRow[1]);
		});
	});

	it("should handle null values for accession and application as empty strings", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("COVER PAGE");

		setupCoverPage({ worksheet, accession: null, application: null });

		const expectedRows = [
			["* ARS662 Last Revised Date:", formatDate(new Date().toISOString())],
			["* Accession #:", ""],
			["* Application #:", ""],
		];

		expectedRows.forEach((expectedRow, index) => {
			const rowIndex = index + 2;
			const row = worksheet.getRow(rowIndex);

			const firstCell = row.getCell(1);
			const secondCell = row.getCell(2);

			expect(firstCell.value).toEqual({
				richText: [
					{ text: expectedRow[0][0], font: { color: { argb: "FFFF0000" }, bold: true } },
					{ text: expectedRow[0].slice(1), font: { name: "BC Sans", bold: true } },
				],
			});

			expect(secondCell.value).toBe(expectedRow[1]);
		});
	});
});
