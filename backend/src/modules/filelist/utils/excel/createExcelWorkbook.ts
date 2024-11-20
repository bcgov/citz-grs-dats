import ExcelJS, { type Workbook } from "exceljs";
import type { FileMetadataZodType, FolderMetadataZodType } from "../../schemas";
import { setWorksheetHeader } from "./setWorksheetHeader";
import { addFolderData } from "./addFolderData";
import { addInstructionsSheet } from "./addInstructionsSheet";
import { addFileMetadata } from "./addFileMetadata";

type FolderRow = FolderMetadataZodType & { folder: string };

type Data = {
	folderRows: FolderRow[];
	fileRows: FileMetadataZodType[];
	accession?: string | null | undefined;
	application?: string | null | undefined;
};

export const createExcelWorkbook = ({
	folderRows,
	fileRows,
	accession = "",
	application = "",
}: Data): Workbook => {
	// Create a workbook and worksheet
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("FOLDER LIST");

	// Set column widths
	worksheet.columns = [
		{ width: 40 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
		{ width: 20 },
	];

	// Set headers for Ministry, Branch, Accession #, and Application #
	setWorksheetHeader({ worksheet, accession, application });

	// Add folder headers and data to the worksheet
	addFolderData({ worksheet, rows: folderRows });

	// Add file list metadata
	const metadataSheet = workbook.addWorksheet("METADATA");
	addFileMetadata({ worksheet: metadataSheet, rows: fileRows });

	// Add Instructions worksheet
	const instructionsSheet = workbook.addWorksheet("INSTRUCTIONS");
	addInstructionsSheet(instructionsSheet);

	return workbook;
};
