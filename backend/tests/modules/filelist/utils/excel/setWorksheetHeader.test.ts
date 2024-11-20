import { Workbook, type Worksheet } from "exceljs";
import { setWorksheetHeader } from "@/modules/filelist/utils/excel/setWorksheetHeader";

describe("Test suite for setWorksheetHeader function", () => {
	let workbook: Workbook;
	let worksheet: Worksheet;

	beforeEach(() => {
		workbook = new Workbook();
		worksheet = workbook.addWorksheet("Test Sheet");
	});

	it("Test case: Should correctly add and style the header row", () => {
		const accession = "12345";
		const application = "12345";

		setWorksheetHeader({ worksheet, accession, application });

		// Check first row content
		const firstRow = worksheet.getRow(1);
		expect(firstRow.getCell(1).value).toEqual("ARS662 Last Revised:");
		expect(firstRow.getCell(2).value).toEqual({
			formula: 'TEXT(TODAY(), "MM-DD-YYYY")',
		});

		// Check first row styles
		expect(firstRow.font).toEqual({
			bold: true,
			color: { argb: "FF000080" }, // Dark blue
		});
		expect(worksheet.getCell("B1").font).toEqual({
			bold: true,
			color: { argb: "FF000080" },
		});
	});

	it("Test case: Should correctly add and style the second row", () => {
		const accession = "12345";
		const application = "12345";

		setWorksheetHeader({ worksheet, accession, application });

		// Check content of specific cells
		expect(worksheet.getCell("B2").value).toEqual("BRANCH: ");
		expect(worksheet.getCell("D2").value).toEqual("ACCESSION #: 12345");
		expect(worksheet.getCell("F2").value).toEqual("APPLICATION #: 12345");

		// Check merged cells
		expect(worksheet.getCell("B2").isMerged).toBe(true);
		expect(worksheet.getCell("D2").isMerged).toBe(true);
		expect(worksheet.getCell("F2").isMerged).toBe(true);

		// Check styles of the second row
		const secondRow = worksheet.getRow(2);
		expect(secondRow.font).toEqual({
			bold: true,
			color: { argb: "FF000080" }, // Dark blue
		});
	});

	it("Test case: Should handle null accession and application gracefully", () => {
		setWorksheetHeader({ worksheet, accession: null, application: null });

		// Check content of specific cells
		expect(worksheet.getCell("B2").value).toEqual("BRANCH: ");
		expect(worksheet.getCell("D2").value).toEqual("ACCESSION #: ");
		expect(worksheet.getCell("F2").value).toEqual("APPLICATION #: ");

		// Check merged cells
		expect(worksheet.getCell("B2").isMerged).toBe(true);
		expect(worksheet.getCell("D2").isMerged).toBe(true);
		expect(worksheet.getCell("F2").isMerged).toBe(true);
	});

	it("Test case: Should correctly handle default empty strings for accession and application", () => {
		setWorksheetHeader({ worksheet });

		// Check content of specific cells
		expect(worksheet.getCell("B2").value).toEqual("BRANCH: ");
		expect(worksheet.getCell("D2").value).toEqual("ACCESSION #: ");
		expect(worksheet.getCell("F2").value).toEqual("APPLICATION #: ");

		// Check merged cells
		expect(worksheet.getCell("B2").isMerged).toBe(true);
		expect(worksheet.getCell("D2").isMerged).toBe(true);
		expect(worksheet.getCell("F2").isMerged).toBe(true);
	});
});
