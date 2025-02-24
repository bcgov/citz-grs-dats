import ExcelJS, { type Workbook } from "exceljs";
import type { FileMetadataZodType, FolderMetadataZodType } from "../../schemas";
import {
  setupCoverPage,
  setupFolderList,
  setupInstructions,
  setupMetadata,
} from "./worksheets";

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

  const today = new Date().toISOString().split("T")[0];

  // Create worksheets
  const coverPageWS = workbook.addWorksheet("COVER PAGE");
  const folderListWS = workbook.addWorksheet(`FILE LIST ${today}`);
  const metadataWS = workbook.addWorksheet(`METADATA ${today}`);
  const instructionsWS = workbook.addWorksheet("INSTRUCTIONS");

  // Populate worksheets
  setupCoverPage({ worksheet: coverPageWS, accession, application });
  setupFolderList({ worksheet: folderListWS, folders: folderRows });
  setupMetadata({ worksheet: metadataWS, files: fileRows });
  setupInstructions({ worksheet: instructionsWS });

  return workbook;
};
