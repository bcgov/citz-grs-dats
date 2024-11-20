import { Workbook, type Worksheet } from "exceljs";
import { addInstructionsSheet } from "@/modules/filelist/utils/excel/addInstructionsSheet";

describe("Test suite for addInstructionsSheet function", () => {
	let workbook: Workbook;
	let worksheet: Worksheet;

	beforeEach(() => {
		workbook = new Workbook();
		worksheet = workbook.addWorksheet("Instructions");
	});

	it('Test case: Should correctly add and style the "Instructions" title', () => {
		addInstructionsSheet(worksheet);

		const titleRow = worksheet.getRow(1); // The first row is for the title
		const titleCell = titleRow.getCell(1); // First cell in the row

		expect(titleCell.value).toBe("Instructions");
		expect(titleCell.font).toEqual({ bold: true });
		expect(titleRow.alignment).toEqual({
			horizontal: "center",
			vertical: "middle",
		});

		titleRow.eachCell((cell) => {
			expect(cell.fill).toEqual({
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFD6F2B3" }, // Background
			});
		});

		// Check merged cells
		expect(worksheet.getCell("A1").isMerged).toBe(true);
		expect(worksheet.getCell("B1").isMerged).toBe(true);
	});

	it("Test case: Should correctly populate instructions rows", () => {
		addInstructionsSheet(worksheet);

		const rows = worksheet.getRows(2, 11); // Rows 2 to 12
		expect(rows?.length).toBe(11);

		const expectedInstructions = [
			["Folder:", "File path to the folder."],
			["Schedule:", "ARCS/ORCS schedule number."],
			["Primary/Secondary:", "ARCS/ORCS primary and secondary numbers."],
			["File ID:", "File identifier or title. Spell out acronyms."],
			["OPR (Y/N):", "Indicate if the office holds the official master copy."],
			["Start Date:", "When the record's active life starts."],
			["End Date:", "When the record's active life ends."],
			["SO Date:", "Date to close the file based on the retention schedule."],
			["FD Date:", "File closure date + 1 day + active/semi-active years."],
			["", ""],
			[
				"Information Schedules:",
				{
					text: "Click here for Information Schedules.",
					hyperlink:
						"https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/information-schedules",
				},
			],
		];

		expectedInstructions.forEach((instruction, rowIndex) => {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			const row = rows![rowIndex];

			// Check content for the first column
			expect(row.getCell(1).value).toBe(instruction[0]);

			// Check content for the second column
			if (typeof instruction[1] === "string") {
				expect(row.getCell(2).value).toBe(instruction[1]);
			} else {
				// For hyperlink objects, check both text and hyperlink
				expect(row.getCell(2).value).toEqual(instruction[1]);
			}

			// Check bold font for the first column
			expect(row.getCell(1).font).toEqual({ bold: true });

			// Check hyperlink formatting for the last row
			if (rowIndex === expectedInstructions.length - 1) {
				const linkCell = row.getCell(2);
				expect(linkCell.value).toEqual(instruction[1]);
				expect(linkCell.font).toEqual({
					underline: true,
					color: { argb: "FF0000FF" }, // Blue color for hyperlinks
				});
			}
		});
	});

	it("Test case: Should correctly set column widths", () => {
		addInstructionsSheet(worksheet);

		const expectedWidths = [30, 170];
		worksheet.columns.forEach((column, index) => {
			expect(column?.width).toBe(expectedWidths[index]);
		});
	});
});
