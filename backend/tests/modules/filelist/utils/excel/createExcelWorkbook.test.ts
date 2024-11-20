import ExcelJS, { type Workbook } from "exceljs";
import { createExcelWorkbook } from "@/modules/filelist/utils/excel/createExcelWorkbook";
import { setWorksheetHeader } from "@/modules/filelist/utils/excel/setWorksheetHeader";
import { addFolderData } from "@/modules/filelist/utils/excel/addFolderData";
import { addInstructionsSheet } from "@/modules/filelist/utils/excel/addInstructionsSheet";
import { addFileMetadata } from "@/modules/filelist/utils/excel/addFileMetadata";
import type { FileMetadataZodType, FolderMetadataZodType } from "@/modules/filelist/schemas";

jest.mock("@/modules/filelist/utils/excel/setWorksheetHeader");
jest.mock("@/modules/filelist/utils/excel/addFolderData");
jest.mock("@/modules/filelist/utils/excel/addInstructionsSheet");
jest.mock("@/modules/filelist/utils/excel/addFileMetadata");

type FolderRow = FolderMetadataZodType & { folder: string };

describe("Test suite for createExcelWorkbook function", () => {
	let folderRows: FolderRow[];
	let fileRows: FileMetadataZodType[];
	let workbook: Workbook;

	beforeEach(() => {
		folderRows = [
			{
				folder: "Folder1",
				schedule: "Schedule1",
				classification: "Primary",
				file: "File1",
				opr: true,
				startDate: "2023-10-01",
				endDate: "2023-10-31",
				soDate: "2023-11-01",
				fdDate: "2023-12-01",
			},
		];

		fileRows = [
			{
				filepath: "/path/to/file1",
				filename: "file1.txt",
				size: "1024",
				birthtime: "2023-10-01T10:00:00Z",
				lastModified: "2023-10-10T12:00:00Z",
				lastAccessed: "2023-10-11T15:00:00Z",
				checksum: "123abc",
			},
		];

		jest.clearAllMocks();
	});

	it("Test case: Should handle undefined accession and application gracefully", () => {
		workbook = createExcelWorkbook({
			folderRows,
			fileRows,
			accession: undefined,
			application: undefined,
		});

		// Check that the workbook has three worksheets
		expect(workbook.worksheets.length).toBe(3);
		expect(workbook.worksheets[0].name).toBe("FOLDER LIST");
		expect(workbook.worksheets[1].name).toBe("METADATA");
		expect(workbook.worksheets[2].name).toBe("INSTRUCTIONS");

		// Ensure helper functions are called with empty strings for undefined accession and application
		const firstWorksheet = workbook.getWorksheet("FOLDER LIST");
		expect(setWorksheetHeader).toHaveBeenCalledWith({
			worksheet: firstWorksheet,
			accession: "",
			application: "",
		});

		expect(addFolderData).toHaveBeenCalledWith({
			worksheet: firstWorksheet,
			rows: folderRows,
		});

		const metadataSheet = workbook.getWorksheet("METADATA");
		expect(addFileMetadata).toHaveBeenCalledWith({
			worksheet: metadataSheet,
			rows: fileRows,
		});

		const instructionsSheet = workbook.getWorksheet("INSTRUCTIONS");
		expect(addInstructionsSheet).toHaveBeenCalledWith(instructionsSheet);
	});

	it("Test case: Should create a workbook with the expected worksheets and use helper functions correctly", () => {
		workbook = createExcelWorkbook({
			folderRows,
			fileRows,
			accession: "12345",
			application: "TestApp",
		});

		// Check that the workbook has three worksheets
		expect(workbook.worksheets.length).toBe(3);
		expect(workbook.worksheets[0].name).toBe("FOLDER LIST");
		expect(workbook.worksheets[1].name).toBe("METADATA");
		expect(workbook.worksheets[2].name).toBe("INSTRUCTIONS");

		// Verify column widths for the first worksheet
		const firstWorksheet = workbook.getWorksheet("FOLDER LIST");
		const expectedWidths = [40, 20, 20, 20, 20, 20, 20, 20, 20];
		firstWorksheet?.columns.forEach((column, index) => {
			expect(column?.width).toBe(expectedWidths[index]);
		});

		// Check that helper functions are called with correct arguments
		expect(setWorksheetHeader).toHaveBeenCalledWith({
			worksheet: firstWorksheet,
			accession: "12345",
			application: "TestApp",
		});

		expect(addFolderData).toHaveBeenCalledWith({
			worksheet: firstWorksheet,
			rows: folderRows,
		});

		const metadataSheet = workbook.getWorksheet("METADATA");
		expect(addFileMetadata).toHaveBeenCalledWith({
			worksheet: metadataSheet,
			rows: fileRows,
		});

		const instructionsSheet = workbook.getWorksheet("INSTRUCTIONS");
		expect(addInstructionsSheet).toHaveBeenCalledWith(instructionsSheet);
	});

	it("Test case: Should handle empty folderRows and fileRows gracefully", () => {
		workbook = createExcelWorkbook({
			folderRows: [],
			fileRows: [],
			accession: "",
			application: "",
		});

		// Check that the workbook still has three worksheets
		expect(workbook.worksheets.length).toBe(3);
		expect(workbook.worksheets[0].name).toBe("FOLDER LIST");
		expect(workbook.worksheets[1].name).toBe("METADATA");
		expect(workbook.worksheets[2].name).toBe("INSTRUCTIONS");

		// Ensure helper functions are called with empty data
		const firstWorksheet = workbook.getWorksheet("FOLDER LIST");
		expect(setWorksheetHeader).toHaveBeenCalledWith({
			worksheet: firstWorksheet,
			accession: "",
			application: "",
		});

		expect(addFolderData).toHaveBeenCalledWith({
			worksheet: firstWorksheet,
			rows: [],
		});

		const metadataSheet = workbook.getWorksheet("METADATA");
		expect(addFileMetadata).toHaveBeenCalledWith({
			worksheet: metadataSheet,
			rows: [],
		});

		const instructionsSheet = workbook.getWorksheet("INSTRUCTIONS");
		expect(addInstructionsSheet).toHaveBeenCalledWith(instructionsSheet);
	});
});
