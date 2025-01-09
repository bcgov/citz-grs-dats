import ExcelJS from "exceljs";
import { addWorksheetToExistingWorkbookBuffer } from "@/modules/filelist/utils/excel";

describe("addWorksheetToExistingWorkbookBuffer", () => {
	// Test case: Adding a worksheet to an existing workbook buffer
	it("should add a worksheet to an existing workbook buffer and return the updated buffer", async () => {
		// Step 1: Create a mock workbook and worksheet
		const mockWorkbook = new ExcelJS.Workbook();
		const mockExistingWorksheet = mockWorkbook.addWorksheet("Existing Worksheet");
		mockExistingWorksheet.addRow(["Header 1", "Header 2", "Header 3"]);
		mockExistingWorksheet.addRow(["Data 1", "Data 2", "Data 3"]);

		// Convert the workbook to a buffer
		const buffer = await mockWorkbook.xlsx.writeBuffer();

		// Step 2: Create a new worksheet to be added
		const newWorkbook = new ExcelJS.Workbook();
		const newWorksheet = newWorkbook.addWorksheet("New Worksheet");
		newWorksheet.addRow(["Column A", "Column B", "Column C"]);
		newWorksheet.addRow(["Value A", "Value B", "Value C"]);

		// Step 3: Call the function
		const updatedBuffer = await addWorksheetToExistingWorkbookBuffer({
			buffer,
			worksheet: newWorksheet,
		});

		// Step 4: Verify the updated workbook
		const updatedWorkbook = new ExcelJS.Workbook();
		await updatedWorkbook.xlsx.load(updatedBuffer);

		// Verify the existing worksheet is still there
		const existingWorksheet = updatedWorkbook.getWorksheet("Existing Worksheet");
		expect(existingWorksheet).toBeDefined();
		expect(existingWorksheet?.rowCount).toBe(2); // 2 rows: header + data

		// Verify the new worksheet has been added
		const addedWorksheet = updatedWorkbook.getWorksheet("New Worksheet");
		expect(addedWorksheet).toBeDefined();
		expect(addedWorksheet?.rowCount).toBe(2); // 2 rows: header + data
		expect(addedWorksheet?.getRow(1).getCell(1).value).toBe("Column A");
		expect(addedWorksheet?.getRow(2).getCell(1).value).toBe("Value A");
	});

	// Test case: Handle invalid buffer input
	it("should throw an error when an invalid buffer is provided", async () => {
		const invalidBuffer = Buffer.from("Invalid Data");
		const newWorkbook = new ExcelJS.Workbook();
		const newWorksheet = newWorkbook.addWorksheet("New Worksheet");

		await expect(
			addWorksheetToExistingWorkbookBuffer({
				buffer: invalidBuffer,
				worksheet: newWorksheet,
			}),
		).rejects.toThrow();
	});

	// Test case: Handle an empty worksheet
	it("should add an empty worksheet to an existing workbook buffer", async () => {
		const mockWorkbook = new ExcelJS.Workbook();
		const mockExistingWorksheet = mockWorkbook.addWorksheet("Existing Worksheet");
		const buffer = await mockWorkbook.xlsx.writeBuffer();

		const newWorkbook = new ExcelJS.Workbook();
		const emptyWorksheet = newWorkbook.addWorksheet("Empty Worksheet");

		const updatedBuffer = await addWorksheetToExistingWorkbookBuffer({
			buffer,
			worksheet: emptyWorksheet,
		});

		const updatedWorkbook = new ExcelJS.Workbook();
		await updatedWorkbook.xlsx.load(updatedBuffer);

		const addedWorksheet = updatedWorkbook.getWorksheet("Empty Worksheet");
		expect(addedWorksheet).toBeDefined();
		expect(addedWorksheet?.rowCount).toBe(0); // Empty worksheet should have no rows
	});
});
