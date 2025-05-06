import type { LanTransferBody } from "@/modules/transfer/schemas";
import ExcelJS from "exceljs";
import { type FolderRow, setupFolderListV2, setupMetadata } from "./worksheets";
import type { FileMetadataZodType } from "../../schemas";
import { PassThrough, type Readable } from "node:stream";

type Props = {
  folders: FolderRow[];
  changes: LanTransferBody["changes"];
  files: FileMetadataZodType[];
  fileListBuffer: Buffer;
};

export const updateFileListV2 = async ({
  folders,
  changes,
  files,
  fileListBuffer,
}: Props): Promise<Readable> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileListBuffer as unknown as ExcelJS.Buffer);

  const today = new Date().toISOString().split("T")[0];

  // Function to generate a unique sheet name
  const getUniqueSheetName = (baseName: string): string => {
    let sheetName = baseName;
    let counter = 1;

    while (workbook.worksheets.some((ws) => ws.name === sheetName)) {
      sheetName = `${baseName} (Updated${counter > 1 ? ` ${counter}` : ""})`;
      counter++;
    }

    return sheetName;
  };

  const folderListSheetName = getUniqueSheetName(`FILE LIST ${today}`);
  const metadataSheetName = getUniqueSheetName(`METADATA ${today}`);

  const folderListV2Worksheet = workbook.addWorksheet(folderListSheetName);
  const metadataV2Worksheet = workbook.addWorksheet(metadataSheetName);

  setupFolderListV2({
    worksheet: folderListV2Worksheet,
    folders,
    changes,
  });
  setupMetadata({ worksheet: metadataV2Worksheet, files });

  const stream = new PassThrough();
  await workbook.xlsx.write(stream);
  stream.end();

  return stream;
};
