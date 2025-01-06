import ExcelJS, { type Worksheet, type Buffer } from "exceljs";

type Data = {
	buffer: Buffer; // Buffer of the existing workbook
	worksheet: Worksheet; // The worksheet to be added
};

export const addWorksheetToExistingWorkbookBuffer = async (props: Data): Promise<Buffer> => {
	const { buffer, worksheet } = props;

	try {
		// Create a workbook and load the buffer into it
		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(buffer);

		// Add the new worksheet to the workbook
		const newWorksheet = workbook.addWorksheet(worksheet.name);

		// Copy the content of the input worksheet to the new worksheet
		worksheet.eachRow((row, rowIndex) => {
			const newRow = newWorksheet.getRow(rowIndex);
			row.eachCell((cell, colIndex) => {
				newRow.getCell(colIndex).value = cell.value;
			});
			newRow.commit();
		});

		// Write the updated workbook back to a buffer
		const updatedBuffer = await workbook.xlsx.writeBuffer();
		return updatedBuffer; // Return the updated buffer
	} catch (error) {
		console.error("Error adding worksheet to existing workbook buffer:", error);
		throw error;
	}
};
