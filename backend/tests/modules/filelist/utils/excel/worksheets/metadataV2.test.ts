import { Workbook } from "exceljs";
import { setupMetadataV2 } from "src/modules/filelist/utils/excel/worksheets";
import type { Worksheet } from "exceljs";
import type { FileMetadataZodType } from "src/modules/filelist/schemas";
import { formatDate } from "src/utils";

// Mock formatDate utility function
jest.mock("src/utils", () => ({
	formatDate: jest.fn((date) => (date ? `Formatted: ${date}` : "")),
}));

// Test suite for setupMetadataV2
describe("setupMetadataV2", () => {
	// Test case: Proper setup of metadata worksheet with changes
	it("should set up the worksheet with the correct structure and populate rows including changes", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("METADATA_V2");

		const files: FileMetadataZodType[] = [
			{
				filepath: "/path/to/file1",
				filename: "file1.txt",
				size: "1024",
				birthtime: "2023-01-01T12:00:00Z",
				lastModified: "2023-06-01T12:00:00Z",
				lastAccessed: "2023-06-02T12:00:00Z",
				checksum: "abc123",
				authors: "John Doe",
				owner: "Owner1",
				company: "Company1",
				computer: "Computer1",
				contentType: "text/plain",
				programName: "Program1",
				lastSaved: "2023-06-03T12:00:00Z",
			},
			{
				filepath: "/path/to/file2",
				filename: "file2.txt",
				size: "2048",
				birthtime: "",
				lastModified: "",
				lastAccessed: "",
				checksum: "def456",
				authors: "",
				owner: "",
				company: "",
				computer: "",
				contentType: "",
				programName: "",
				lastSaved: "",
			},
		];

		const changes = [
			{
				originalFilePath: "/path/to/file1",
				newFilePath: "/new/path/to/file1",
				deleted: false,
			},
			{
				originalFilePath: "/path/to/file2",
				deleted: true,
			},
		];

		setupMetadataV2({ worksheet, files, changes });

		// Check column widths
		expect(worksheet.columns?.map((col) => col?.width)).toEqual([
			50, 50, 30, 30, 20, 50, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
		]);

		// Check header row
		const headerRow = worksheet.getRow(1);
		const headers = [
			"Original File Path",
			"New File Path",
			"File Name",
			"Change",
			"Size",
			"Checksum",
			"Created On",
			"Last Modified",
			"Last Accessed",
			"Last Saved",
			"Authors",
			"Owner",
			"Company",
			"Computer",
			"Content-Type",
			"Program Name",
		];
		headers.forEach((header, index) => {
			const cell = headerRow.getCell(index + 1);
			expect(cell.value).toBe(header);
			expect(cell.font).toEqual({ name: "BC Sans", bold: true, color: { argb: "FF000000" } });
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
			to: "P1",
		});

		// Check data rows
		const dataRows = worksheet.getRows(2, files.length) ?? [];
		expect(dataRows.length).toBe(files.length);

		dataRows.forEach((row, rowIndex) => {
			const fileData = files[rowIndex];
			const change = changes.find((c) => c.originalFilePath === fileData.filepath);

			expect(row.getCell(1).value).toBe(fileData.filepath);
			expect(row.getCell(2).value).toBe(change?.newFilePath || "");
			expect(row.getCell(3).value).toBe(fileData.filename);
			expect(row.getCell(4).value).toBe(
				change?.deleted ? "Deleted" : change?.newFilePath ? "Path Changed" : "Unchanged",
			);
			expect(row.getCell(5).value).toBe(fileData.size);
			expect(row.getCell(6).value).toBe(fileData.checksum);
			expect(row.getCell(7).value).toBe(formatDate(fileData.birthtime));
			expect(row.getCell(8).value).toBe(formatDate(fileData.lastModified));
			expect(row.getCell(9).value).toBe(formatDate(fileData.lastAccessed));
			expect(row.getCell(10).value).toBe(formatDate(fileData.lastSaved || ""));
			expect(row.getCell(11).value).toBe(fileData.authors || "");
			expect(row.getCell(12).value).toBe(fileData.owner || "");
			expect(row.getCell(13).value).toBe(fileData.company || "");
			expect(row.getCell(14).value).toBe(fileData.computer || "");
			expect(row.getCell(15).value).toBe(fileData.contentType || "");
			expect(row.getCell(16).value).toBe(fileData.programName || "");
		});
	});

	// Test case: Handle empty files and changes arrays
	it("should handle empty files and changes arrays gracefully", () => {
		const workbook = new Workbook();
		const worksheet: Worksheet = workbook.addWorksheet("METADATA_V2");

		setupMetadataV2({ worksheet, files: [], changes: [] });

		// Check that only the header row is present
		const rows = worksheet.getRows(1, worksheet.rowCount) ?? [];
		expect(rows.length).toBe(1); // Only header row
		const headerRow = rows[0];
		const headers = [
			"Original File Path",
			"New File Path",
			"File Name",
			"Change",
			"Size",
			"Checksum",
			"Created On",
			"Last Modified",
			"Last Accessed",
			"Last Saved",
			"Authors",
			"Owner",
			"Company",
			"Computer",
			"Content-Type",
			"Program Name",
		];
		headers.forEach((header, index) => {
			expect(headerRow.getCell(index + 1).value).toBe(header);
		});
	});
});
