import { Workbook, type Worksheet } from "exceljs";
import { addFileMetadata } from "@/modules/filelist/utils/excel/addFileMetadata";
import type { FileMetadataZodType } from "@/modules/filelist/schemas";

describe("Test suite for addFileMetadata function", () => {
	let workbook: Workbook;
	let worksheet: Worksheet;

	beforeEach(() => {
		workbook = new Workbook();
		worksheet = workbook.addWorksheet("Test Sheet");
	});

	it("Test case: Should correctly add and style column headers", () => {
		const rows: FileMetadataZodType[] = [];

		addFileMetadata({ worksheet, rows });

		const headerRow = worksheet.getRow(1); // Headers are added to the first row

		const expectedHeaders = [
			"Path",
			"Name",
			"Size",
			"Created On",
			"Last Modified",
			"Last Accessed",
			"Checksum",
		];

		expectedHeaders.forEach((header, index) => {
			const cell = headerRow.getCell(index + 1);
			expect(cell.value).toBe(header);
			expect(cell.font).toEqual({ bold: true, color: { argb: "FF000000" } }); // Black text
			expect(cell.fill).toEqual({
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFD6F2B3" }, // Background color
			});
			expect(cell.alignment).toEqual({ horizontal: "left" });
			expect(cell.border).toEqual({
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			});
		});

		// Verify autofilter
		expect(worksheet.autoFilter).toEqual({
			from: "A1",
			to: "G1",
		});
	});

	it("Test case: Should correctly populate rows with file metadata", () => {
		const rows: FileMetadataZodType[] = [
			{
				filepath: "/path/to/file1",
				filename: "file1.txt",
				size: "1024",
				birthtime: "2023-10-01T10:00:00Z",
				lastModified: "2023-10-10T12:00:00Z",
				lastAccessed: "2023-10-11T15:00:00Z",
				checksum: "123abc",
			},
			{
				filepath: "/path/to/file2",
				filename: "file2.txt",
				size: "2048",
				birthtime: "",
				lastModified: "",
				lastAccessed: "",
				checksum: "456def",
			},
		];

		addFileMetadata({ worksheet, rows });

		const dataRows = worksheet.getRows(2, 2); // Rows start from the 2nd row

		expect(dataRows?.length).toBe(2);

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const [firstRow, secondRow] = dataRows!;

		// Check content of the first row
		expect(firstRow.values).toEqual([
			undefined, // Row values are 1-indexed
			"/path/to/file1",
			"file1.txt",
			"1024",
			"10-01-2023",
			"10-10-2023",
			"10-11-2023",
			"123abc",
		]);

		// Check content of the second row
		expect(secondRow.values).toEqual([
			undefined,
			"/path/to/file2",
			"file2.txt",
			"2048",
			"",
			"",
			"",
			"456def",
		]);
	});

	it("Test case: Should handle invalid dates and preserve original values", () => {
		const rows: FileMetadataZodType[] = [
			{
				filepath: "/path/to/file1",
				filename: "file1.txt",
				size: "1024",
				birthtime: "invalid-date",
				lastModified: "not-a-date",
				lastAccessed: "2023-10-11T15:00:00Z",
				checksum: "123abc",
			},
		];

		addFileMetadata({ worksheet, rows });

		const dataRow = worksheet.getRow(2); // First data row

		expect(dataRow.values).toEqual([
			undefined,
			"/path/to/file1",
			"file1.txt",
			"1024",
			"invalid-date",
			"not-a-date",
			"10-11-2023",
			"123abc",
		]);
	});

	it("Test case: Should handle empty rows gracefully", () => {
		const rows: FileMetadataZodType[] = [];

		addFileMetadata({ worksheet, rows });

		const rowCount = worksheet.rowCount;

		// Ensure no additional rows were added beyond the header
		expect(rowCount).toBe(1); // Only header row exists
	});

	it("Test case: Should correctly set column widths", () => {
		const rows: FileMetadataZodType[] = [];

		addFileMetadata({ worksheet, rows });

		const expectedWidths = [50, 30, 20, 20, 20, 20, 50];
		worksheet.columns.forEach((column, index) => {
			expect(column?.width).toBe(expectedWidths[index]);
		});
	});
});
