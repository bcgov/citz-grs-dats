import { Workbook } from "exceljs";
import { setupFolderList } from "@/modules/filelist/utils/excel/worksheets";
import type { Worksheet } from "exceljs";
import type { FolderMetadataZodType } from "@/modules/filelist/schemas";
import { formatDate } from "@/utils";

// Mock formatDate utility function
jest.mock("@/utils", () => ({
	formatDate: jest.fn((date) => (date ? `Formatted: ${date}` : "")),
}));

// Test suite for setupFolderList
describe("setupFolderList", () => {
	// Test case: Proper setup of folder list worksheet
	it("should set up the worksheet with the correct structure and populate rows", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("FOLDER LIST");

		const folders: Array<FolderMetadataZodType & { folder: string }> = [
			{
				folder: "Folder 1",
				schedule: "Schedule 1",
				classification: "Confidential",
				file: "File A",
				opr: true,
				startDate: "2023-01-01",
				endDate: "2023-12-31",
				soDate: "2023-06-01",
				fdDate: "2023-12-01",
			},
			{
				folder: "Folder 2",
				schedule: "Schedule 2",
				classification: "Public",
				file: "File B",
				opr: false,
				startDate: null,
				endDate: null,
				soDate: null,
				fdDate: null,
			},
		];

		setupFolderList({ worksheet, folders });

		// Check column widths
		expect(worksheet.columns?.map((col) => col?.width)).toEqual([
			40, 20, 20, 20, 40, 20, 20, 35, 30,
		]);

		// Check header row
		const headerRow = worksheet.getRow(1);
		const headers = [
			"* Folder",
			"* Schedule",
			"* Classification",
			"File ID",
			"* Office of Primary Responsibility (OPR) - (Y/N)",
			"* Start Date",
			"* End Date",
			"Superseded/Obsolete (SO) Date",
			"* Final Disposition (FD) Date",
		];
		headers.forEach((header, index) => {
			const cell = headerRow.getCell(index + 1);
			if (header.startsWith("*")) {
				expect(cell.value).toEqual({
					richText: [
						{ text: "*", font: { color: { argb: "FFFF0000" }, name: "BC Sans", bold: true } },
						{ text: header.slice(1), font: { name: "BC Sans", bold: true } },
					],
				});
			} else {
				expect(cell.value).toBe(header);
				expect(cell.font).toEqual({ name: "BC Sans", bold: true, color: { argb: "FF000000" } });
			}
			expect(cell.fill).toEqual({
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFC1DDFC" },
			});
			expect(cell.alignment).toEqual({ horizontal: "left" });
			expect(cell.border).toEqual({
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			});
		});

		// Check autoFilter
		expect(worksheet.autoFilter).toEqual({
			from: "A1",
			to: "I1",
		});

		// Check data rows
		const dataRows = worksheet.getRows(2, folders.length) ?? [];
		expect(dataRows.length).toBe(folders.length);

		dataRows.forEach((row, rowIndex) => {
			const folderData = folders[rowIndex];
			expect(row.getCell(1).value).toBe(folderData.folder);
			expect(row.getCell(2).value).toBe(folderData.schedule);
			expect(row.getCell(3).value).toBe(folderData.classification);
			expect(row.getCell(4).value).toBe(folderData.file);
			expect(row.getCell(5).value).toBe(folderData.opr ? "Y" : "N");
			expect(row.getCell(6).value).toBe(formatDate(folderData.startDate));
			expect(row.getCell(7).value).toBe(formatDate(folderData.endDate));
			expect(row.getCell(8).value).toBe(formatDate(folderData.soDate));
			expect(row.getCell(9).value).toBe(formatDate(folderData.fdDate));
		});
	});

	// Test case: Handle empty folders array
	it("should handle an empty folders array gracefully", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("FOLDER LIST");

		setupFolderList({ worksheet, folders: [] });

		// Check that only the header row is present
		const rows = worksheet.getRows(1, worksheet.rowCount) ?? [];
		expect(rows.length).toBe(1); // Only header row
		const headerRow = rows[0];
		expect(headerRow.getCell(1).value).toEqual({
			richText: [
				{ text: "*", font: { color: { argb: "FFFF0000" }, name: "BC Sans", bold: true } },
				{ text: " Folder", font: { name: "BC Sans", bold: true } },
			],
		});
	});
});
