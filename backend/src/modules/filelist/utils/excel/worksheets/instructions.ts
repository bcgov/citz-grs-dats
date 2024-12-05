import type { Worksheet } from "exceljs";

type Data = {
	worksheet: Worksheet;
};

export const setupInstructions = ({ worksheet }: Data) => {
	// Set column widths
	worksheet.columns = [{ width: 48 }, { width: 145 }];

	// Add header text and merge the first two columns
	const headerRow = worksheet.addRow(["Instructions"]);
	worksheet.mergeCells("A1:B1");

	// Style the header text
	headerRow.eachCell((cell, index) => {
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFC1DDFC" }, // Background
		};
		cell.font = { name: "BC Sans", bold: true }; // Use 'BC Sans'
	});
	headerRow.alignment = { horizontal: "center", vertical: "middle" };

	// Add instruction data
	const instructionRows = [
		[
			"Complete this document by filling out the required fields marked by '*' on the 'COVER PAGE' and 'FILE LIST' sheets.",
		],
		["For more information, please reference the legend and link to documentation below."],
		[""],
		[
			"Records Management: ",
			"https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management",
		],
		[""],
	];

	instructionRows.forEach((row, index) => {
		const newRow = worksheet.addRow(row);
		// Apply font style to all cells
		newRow.eachCell((cell) => {
			cell.font = { name: "BC Sans" }; // Use 'BC Sans'
		});

		if (index > 1) {
			// Make the first column bold
			newRow.getCell(1).font = { name: "BC Sans", bold: true };
		}

		// If the second column contains a URL, add it as a hyperlink
		if (index === instructionRows.length - 2) {
			const linkCell = newRow.getCell(2);
			linkCell.value = {
				text: "Click here for Records Management documentation.",
				hyperlink: row[1], // Use the URL as the hyperlink
			};
			linkCell.font = {
				name: "BC Sans", // Use 'BC Sans'
				underline: true,
				color: { argb: "FF0000FF" }, // Blue color for hyperlinks
			};
		}
	});

	worksheet.mergeCells("A2:B2");
	worksheet.mergeCells("A3:B3");

	// Add legend text and merge the first two columns
	const legendRow = worksheet.addRow(["Legend"]);
	worksheet.mergeCells("A6:B6");

	// Style the legend text
	legendRow.eachCell((cell) => {
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFC1DDFC" }, // Background
		};
		cell.font = { name: "BC Sans", bold: true }; // Use 'BC Sans'
	});
	legendRow.alignment = { horizontal: "center", vertical: "middle" };

	// Add legend data
	const legendRows = [
		["Folder:", "File path to the folder."],
		["Schedule:", "Information Schedule number (e.g. 100001 for ARCS)."],
		["Classification:", "Classification number (e.g. 201-40 for Cabinet Submissions)."],
		[
			"File ID:",
			"File identifier to link multiple folders, if used (e.g. PEP for Provincial Emergency Program).",
		],
		[
			"Office of Primary Responsibility (OPR) - (Y/N):",
			"Office of Primary Responsibility (OPR) maintains the official copy of the records.",
		],
		["Start Date:", "Date the file was opened."],
		["End Date:", "Date the file was closed."],
		[
			"Superseded/Obsolete (SO) Date:",
			"Date the file became Superseded or Obsolete (SO), if applicable.",
		],
		["Final Disposition (FD) Date:", "Date the file was eligible for Final Disposition (FD)."],
	];

	legendRows.forEach((row) => {
		const newRow = worksheet.addRow(row);
		// Apply font style to all cells
		newRow.eachCell((cell) => {
			cell.font = { name: "BC Sans" }; // Use 'BC Sans'
		});

		// Make the first column bold
		newRow.getCell(1).font = { name: "BC Sans", bold: true };
	});
};
