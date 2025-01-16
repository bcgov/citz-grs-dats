import type { LanTransferBody } from "@/modules/transfer/schemas";
import ExcelJS from "exceljs";
import { type FolderRow, setupFolderListV2, setupMetadata } from "./worksheets";
import { addWorksheetToExistingWorkbookBuffer } from "./addWorksheetToExistingWorkbookBuffer";
import type { FileMetadataZodType } from "../../schemas";

type Props = {
  folders: FolderRow[];
  changes: LanTransferBody["changes"];
  files: FileMetadataZodType[];
  fileListBuffer: LanTransferBody["fileListBuffer"];
};

export const updateFileListV2 = async ({
  folders,
  changes,
  files,
  fileListBuffer,
}: Props): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const folderListV2Worksheet = workbook.addWorksheet("FILE LIST V2");
  const metadataV2Worksheet = workbook.addWorksheet("METADATA V2");

  setupFolderListV2({
    worksheet: folderListV2Worksheet,
    folders,
    changes,
  });
  setupMetadata({ worksheet: folderListV2Worksheet, files });

  return (await addWorksheetToExistingWorkbookBuffer({
    buffer: fileListBuffer,
    worksheet: metadataV2Worksheet,
  })) as Buffer;
};
