import type { Worksheet } from "exceljs";

export const addInstructionsSheet = (worksheet: Worksheet) => {
	// Set column widths
	worksheet.columns = [{ width: 30 }, { width: 170 }];

	// Add "Instructions" text and merge the first two columns
	const instructionRow = worksheet.addRow(["Instructions"]);
	worksheet.mergeCells("A1:B1");

	// Style the "Instructions" text
	instructionRow.font = { bold: true };
	instructionRow.eachCell((cell) => {
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFD6F2B3" }, // Background
		};
	});
	instructionRow.alignment = { horizontal: "center", vertical: "middle" };

	// Add instructions data
	const instructionRows = [
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
			"https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/information-schedules",
		],
	];

	instructionRows.forEach((row, index) => {
		const newRow = worksheet.addRow(row);
		newRow.getCell(1).font = { bold: true }; // Make the first column bold

		// If the second column contains a URL, add it as a hyperlink
		if (index === instructionRows.length - 1) {
			const linkCell = newRow.getCell(2);
			linkCell.value = {
				text: "Click here for Information Schedules.",
				hyperlink: row[1], // Use the URL as the hyperlink
			};
			linkCell.font = {
				underline: true,
				color: { argb: "FF0000FF" }, // Blue color for hyperlinks
			};
		}
	});
};
