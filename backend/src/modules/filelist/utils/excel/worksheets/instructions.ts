import type { Worksheet } from "exceljs";

type Data = {
	worksheet: Worksheet;
};

export const setupInstructions = ({ worksheet }: Data) => {
	// Set column widths
	worksheet.columns = [{ width: 30 }, { width: 170 }];

	// Add header text and merge the first two columns
	const headerRow = worksheet.addRow(["Instructions"]);
	worksheet.mergeCells("A1:B1");

	// Style the header text
	headerRow.font = { bold: true };
	headerRow.eachCell((cell) => {
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFD6F2B3" }, // Background
		};
	});
	headerRow.alignment = { horizontal: "center", vertical: "middle" };

	// Add data
	const rows = [
		["Folder:", "File path to the folder."],
		["Schedule:", "Information Schedule number (e.g. 100001 for ARCS)."],
		["Classification:", "Classification number (e.g. 201-40 for Cabinet Submissions)."],
		[
			"File ID:",
			"File identifier to link multiple folders, if used (e.g. PEP for Provincial Emergency Program).",
		],
		[
			"OPR (Y/N):",
			"Office of Primary Responsibility (OPR) maintains the official copy of the records.",
		],
		["Start Date:", "Date the file was opened."],
		["End Date:", "Date the file was closed."],
		["SO Date:", "Date the file became Superseded or Obsolete (SO), if applicable."],
		["FD Date:", "Date the file was eligible for Final Disposition (FD)."],
		["", ""],
		[
			"Information Schedules:",
			"https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/information-schedules",
		],
	];

	rows.forEach((row, index) => {
		const newRow = worksheet.addRow(row);
		// Make the first column bold and blue
		newRow.getCell(1).font = { bold: true, color: { argb: "FF000080" } };

		// If the second column contains a URL, add it as a hyperlink
		if (index === rows.length - 1) {
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
