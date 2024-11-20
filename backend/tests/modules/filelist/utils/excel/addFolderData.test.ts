import { Workbook, type Worksheet } from "exceljs";
import { addFolderData } from "@/modules/filelist/utils/excel/addFolderData";
import type { FolderMetadataZodType } from "@/modules/filelist/schemas";

describe("Test suite for addFolderData function", () => {
	let workbook: Workbook;
	let worksheet: Worksheet;

	beforeEach(() => {
		workbook = new Workbook();
		worksheet = workbook.addWorksheet("Test Sheet");
		worksheet.addRow([]); // Simulate the first row
		worksheet.addRow([]); // Simulate the second row
	});

	it("Test case: Should correctly add and style column headers", () => {
		type FolderRow = FolderMetadataZodType & { folder: string };
		const rows: FolderRow[] = [];

		addFolderData({ worksheet, rows });

		const headerRow = worksheet.getRow(3); // Headers are added to the third row

		const expectedHeaders = [
			"Folder",
			"Schedule",
			"Primary/Secondary",
			"FILE ID",
			"OPR (Y/N)",
			"Start Date",
			"End Date",
			"SO Date",
			"FD Date",
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
			from: "A3",
			to: "I3",
		});
	});

	it("Test case: Should correctly populate rows with folder data", () => {
		type FolderRow = FolderMetadataZodType & { folder: string };
		const rows: FolderRow[] = [
			{
				folder: "Folder1",
				schedule: "Schedule1",
				classification: "Primary",
				file: "",
				opr: true,
				startDate: "2023-10-01",
				endDate: "2023-10-31",
				soDate: "2023-11-01",
				fdDate: "2023-12-01",
			},
			{
				folder: "Folder2",
				schedule: "Schedule2",
				classification: "Secondary",
				file: "",
				opr: false,
				startDate: null,
				endDate: null,
				soDate: "2023-11-15",
				fdDate: null,
			},
		];

		addFolderData({ worksheet, rows });

		const dataRows = worksheet.getRows(4, 2); // Rows start from the 4th row

		expect(dataRows?.length).toBe(2);

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const [firstRow, secondRow] = dataRows!;

		// Check content of the first row
		expect(firstRow.values).toEqual([
			undefined, // Row values are 1-indexed
			"Folder1",
			"Schedule1",
			"Primary",
			"",
			"Y",
			"10-01-2023",
			"10-31-2023",
			"11-01-2023",
			"12-01-2023",
		]);

		// Check content of the second row
		expect(secondRow.values).toEqual([
			undefined,
			"Folder2",
			"Schedule2",
			"Secondary",
			"",
			"N",
			"",
			"",
			"11-15-2023",
			"",
		]);
	});

	it("Test case: Should handle empty rows gracefully", () => {
		type FolderRow = FolderMetadataZodType & { folder: string };
		const rows: FolderRow[] = [];

		addFolderData({ worksheet, rows });

		const rowCount = worksheet.rowCount;

		// Ensure no additional rows were added beyond the header
		expect(rowCount).toBe(3); // First two rows + header row
	});

	it("Test case: Should handle invalid dates and preserve original values", () => {
		type FolderRow = FolderMetadataZodType & { folder: string };
		const rows: FolderRow[] = [
			{
				folder: "Folder1",
				schedule: "Schedule1",
				classification: "Primary",
				file: "",
				opr: true,
				startDate: "invalid-date",
				endDate: "2023-10-31",
				soDate: "not-a-date",
				fdDate: "2023-12-01",
			},
		];

		addFolderData({ worksheet, rows });

		const dataRow = worksheet.getRow(4); // First data row

		expect(dataRow.values).toEqual([
			undefined,
			"Folder1",
			"Schedule1",
			"Primary",
			"",
			"Y",
			"invalid-date",
			"10-31-2023",
			"not-a-date",
			"12-01-2023",
		]);
	});
});
