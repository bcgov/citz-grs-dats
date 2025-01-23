import ExcelJS, { type Workbook } from "exceljs";
import { updateFileListV2 } from "@/modules/filelist/utils/excel/updateFileListV2";
import {
  setupFolderListV2,
  setupMetadata,
  type FolderRow,
} from "@/modules/filelist/utils/excel/worksheets";
import type { LanTransferBody } from "@/modules/transfer/schemas";
import type { FileMetadataZodType } from "@/modules/filelist/schemas";

jest.mock("@/modules/filelist/utils/excel/worksheets", () => ({
  setupFolderListV2: jest.fn(),
  setupMetadata: jest.fn(),
}));

describe("updateFileListV2", () => {
  // Test case: Successfully updates the file list with new worksheets
  it("should update the file list with new worksheets and return a buffer", async () => {
    const folders: FolderRow[] = [
      {
        folder: "Folder 1",
        schedule: "2023",
        classification: "Confidential",
        file: "File A",
        opr: true,
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        soDate: null,
        fdDate: null,
      },
    ];

    const changes: LanTransferBody["changes"] = [
      {
        originalFolderPath: "Old/Folder1",
        newFolderPath: "New/Folder1",
        deleted: false,
      },
    ];

    const files: FileMetadataZodType[] = [
      {
        filepath: "/path/to/file1",
        filename: "file1.txt",
        size: "1024",
        birthtime: "2023-01-01T12:00:00Z",
        lastModified: "2023-06-01T12:00:00Z",
        lastAccessed: "2023-06-02T12:00:00Z",
        checksum: "abc123",
      },
    ];

    const mockBuffer = Buffer.from("mock file list buffer");
    const mockWorkbook = new ExcelJS.Workbook();
    jest
      .spyOn(mockWorkbook.xlsx, "load")
      .mockResolvedValue(undefined as unknown as Workbook);
    jest.spyOn(mockWorkbook.xlsx, "writeBuffer").mockResolvedValue(mockBuffer);
    jest.spyOn(ExcelJS, "Workbook").mockImplementation(() => mockWorkbook);

    const result = await updateFileListV2({
      folders,
      changes,
      files,
      fileListBuffer: mockBuffer,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(setupFolderListV2).toHaveBeenCalledWith({
      worksheet: expect.any(Object),
      folders,
      changes,
    });
    expect(setupMetadata).toHaveBeenCalledWith({
      worksheet: expect.any(Object),
      files,
    });
  });
});
