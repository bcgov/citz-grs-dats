import { Workbook } from "exceljs";
import { setupFolderListV2 } from "@/modules/filelist/utils/excel/worksheets";
import type { Worksheet } from "exceljs";
import type { FolderMetadataZodType } from "@/modules/filelist/schemas";

// Mock formatDate utility function
jest.mock("@/utils", () => ({
  formatDate: jest.fn((date) => (date ? `Formatted: ${date}` : "")),
}));

describe("setupFolderListV2", () => {
  let workbook: Workbook;
  let worksheet: Worksheet;

  beforeEach(() => {
    workbook = new Workbook();
    worksheet = workbook.addWorksheet("FOLDER LIST V2");
  });

  it("should set up the worksheet with the correct structure and populate rows", () => {
    const folders: Array<FolderMetadataZodType & { folder: string }> = [
      {
        folder: "New Folder 1",
        schedule: "Schedule 1",
        classification: "Confidential",
        file: "File A",
        opr: true,
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        soDate: "2023-06-01",
        fdDate: "2023-12-01",
      },
    ];

    const changes = [
      {
        originalFolderPath: "Folder 1",
        newFolderPath: "New Folder 1",
        deleted: false,
      },
    ];

    setupFolderListV2({ worksheet, folders, changes });

    expect(worksheet.columns?.map((col) => col?.width)).toEqual([
      40, 40, 20, 20, 20, 20, 40, 20, 20, 35, 30,
    ]);

    const headerRow = worksheet.getRow(1);
    const headers = [
      "Original Folder Path",
      "New Folder Path",
      "Change",
      "Schedule",
      "Classification",
      "File ID",
      "Office of Primary Responsibility (OPR) - (Y/N)",
      "Start Date",
      "End Date",
      "Superseded/Obsolete (SO) Date",
      "Final Disposition (FD) Date",
    ];
    headers.forEach((header, index) => {
      expect(headerRow.getCell(index + 1).value).toBe(header);
    });

    expect(worksheet.autoFilter).toEqual({
      from: "A1",
      to: "K1",
    });
  });

  it("should correctly apply changes to the folder list", () => {
    const folders = [
      {
        folder: "Folder B",
        schedule: "Schedule A",
        classification: "Confidential",
        file: "File X",
        opr: true,
        startDate: "2023-05-01",
        endDate: "2023-10-01",
        soDate: "2023-07-01",
        fdDate: "2023-11-01",
      },
    ];
    const changes = [
      {
        originalFolderPath: "Folder A",
        newFolderPath: "Folder B",
        deleted: false,
      },
    ];

    setupFolderListV2({ worksheet, folders, changes });

    const dataRow = worksheet.getRow(2);
    expect(dataRow.getCell(1).value).toBe("Folder A");
    expect(dataRow.getCell(2).value).toBe("Folder B");
    expect(dataRow.getCell(3).value).toBe("Path Changed");
  });
});
