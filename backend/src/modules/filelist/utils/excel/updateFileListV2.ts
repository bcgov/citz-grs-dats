import type { LanTransferBody } from "@/modules/transfer/schemas";
import ExcelJS from "exceljs";
import { type FolderRow, setupFolderListV2, setupMetadata } from "./worksheets";
import type { FileMetadataZodType } from "../../schemas";

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
}: Props): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileListBuffer as unknown as ExcelJS.Buffer);

  const folderListV2Worksheet = workbook.addWorksheet("FILE LIST V2");
  const metadataV2Worksheet = workbook.addWorksheet("METADATA V2");

  setupFolderListV2({
    worksheet: folderListV2Worksheet,
    folders,
    changes,
  });
  setupMetadata({ worksheet: metadataV2Worksheet, files });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
};
