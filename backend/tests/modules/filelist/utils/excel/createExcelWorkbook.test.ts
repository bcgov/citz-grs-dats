import ExcelJS from "exceljs";
import { createExcelWorkbook } from "@/modules/filelist/utils/excel";
import {
	setupCoverPage,
	setupFolderList,
	setupInstructions,
	setupMetadata,
} from "@/modules/filelist/utils/excel/worksheets";
import type { FileMetadataZodType, FolderMetadataZodType } from "@/modules/filelist/schemas";

// Mock worksheet setup functions
jest.mock("@/modules/filelist/utils/excel/worksheets", () => ({
	setupCoverPage: jest.fn(),
	setupFolderList: jest.fn(),
	setupMetadata: jest.fn(),
	setupInstructions: jest.fn(),
}));

describe("createExcelWorkbook", () => {
	// Test case: Workbook creation and worksheet population
	it("should create a workbook with all required worksheets and populate them", () => {
		const folderRows: Array<FolderMetadataZodType & { folder: string }> = [
			{
				folder: "Folder 1",
				schedule: "2023",
				classification: "Confidential",
				file: "File A",
				opr: true,
				startDate: "2023-01-01",
				endDate: "2023-12-31",
				soDate: null,
				fdDate: null,
			},
			{
				folder: "Folder 2",
				schedule: "2024",
				classification: "Public",
				file: "File B",
				opr: false,
				startDate: "2024-01-01",
				endDate: "2024-12-31",
				soDate: null,
				fdDate: null,
			},
		];

		const fileRows: FileMetadataZodType[] = [
			{
				filepath: "/path/to/file1",
				filename: "file1.txt",
				size: "1024",
				birthtime: "2023-01-01T12:00:00Z",
				lastModified: "2023-06-01T12:00:00Z",
				lastAccessed: "2023-06-02T12:00:00Z",
				checksum: "abc123",
			},
			{
				filepath: "/path/to/file2",
				filename: "file2.txt",
				size: "2048",
				birthtime: "2023-02-01T12:00:00Z",
				lastModified: "2023-07-01T12:00:00Z",
				lastAccessed: "2023-07-02T12:00:00Z",
				checksum: "def456",
			},
		];

		const accession = "123";
		const application = "Test Application";

		const workbook = createExcelWorkbook({
			folderRows,
			fileRows,
			accession,
			application,
		});

		expect(workbook).toBeInstanceOf(ExcelJS.Workbook);

		// Verify worksheet existence
		expect(workbook.getWorksheet("COVER PAGE")).toBeDefined();
		expect(workbook.getWorksheet("FOLDER LIST")).toBeDefined();
		expect(workbook.getWorksheet("METADATA")).toBeDefined();
		expect(workbook.getWorksheet("INSTRUCTIONS")).toBeDefined();

		// Verify worksheet population calls
		expect(setupCoverPage).toHaveBeenCalledWith({
			worksheet: expect.any(Object),
			accession,
			application,
		});
		expect(setupFolderList).toHaveBeenCalledWith({
			worksheet: expect.any(Object),
			folders: folderRows,
		});
		expect(setupMetadata).toHaveBeenCalledWith({
			worksheet: expect.any(Object),
			files: fileRows,
		});
		expect(setupInstructions).toHaveBeenCalledWith({
			worksheet: expect.any(Object),
		});
	});

	// Test case: Default values for optional parameters
	it("should handle default values for optional parameters", () => {
		const folderRows: Array<FolderMetadataZodType & { folder: string }> = [];
		const fileRows: FileMetadataZodType[] = [];

		const workbook = createExcelWorkbook({
			folderRows,
			fileRows,
		});

		expect(workbook).toBeInstanceOf(ExcelJS.Workbook);

		// Verify worksheet existence
		expect(workbook.getWorksheet("COVER PAGE")).toBeDefined();
		expect(workbook.getWorksheet("FOLDER LIST")).toBeDefined();
		expect(workbook.getWorksheet("METADATA")).toBeDefined();
		expect(workbook.getWorksheet("INSTRUCTIONS")).toBeDefined();

		// Verify worksheet population calls
		expect(setupCoverPage).toHaveBeenCalledWith({
			worksheet: expect.any(Object),
			accession: "",
			application: "",
		});
		expect(setupFolderList).toHaveBeenCalledWith({
			worksheet: expect.any(Object),
			folders: folderRows,
		});
		expect(setupMetadata).toHaveBeenCalledWith({
			worksheet: expect.any(Object),
			files: fileRows,
		});
		expect(setupInstructions).toHaveBeenCalledWith({
			worksheet: expect.any(Object),
		});
	});
});
