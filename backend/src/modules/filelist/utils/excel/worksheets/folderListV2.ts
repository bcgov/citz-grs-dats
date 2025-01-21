import type { Worksheet } from "exceljs";
import type { FolderMetadataZodType } from "../../../schemas";
import { formatDate } from "src/utils";

type Change = {
  originalFolderPath: string;
  newFolderPath?: string;
  deleted: boolean;
};

export type FolderRow = FolderMetadataZodType & { folder: string };

type Data = {
  worksheet: Worksheet;
  folders: FolderRow[];
  changes: Change[];
};

export const setupFolderListV2 = ({ worksheet, folders, changes }: Data) => {
  // Set column widths
  worksheet.columns = [
    { width: 40 },
    { width: 40 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 40 },
    { width: 20 },
    { width: 20 },
    { width: 35 },
    { width: 30 },
  ];

  // Add column headers
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
  const headerRow = worksheet.addRow(headers);

  headerRow.eachCell((cell, colNumber) => {
    const headerText = headers[colNumber - 1]; // Get corresponding header text
    if (headerText.startsWith("*")) {
      // Apply richText formatting for headers starting with '*'
      cell.value = {
        richText: [
          {
            text: "*",
            font: { color: { argb: "FFFF0000" }, name: "BC Sans", bold: true },
          }, // Red for '*'
          { text: headerText.slice(1), font: { name: "BC Sans", bold: true } }, // Normal for the rest
        ],
      };
    } else {
      cell.font = { name: "BC Sans", bold: true, color: { argb: "FF000000" } }; // Black text
    }
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC1DDFC" }, // Background
    };
    cell.alignment = { horizontal: "left" }; // Align to the left
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Enable sorting for the table headers
  worksheet.autoFilter = {
    from: "A1",
    to: "K1",
  };

  const getChanges = (folder: string) =>
    changes.find(
      (c) =>
        c.newFolderPath?.replaceAll("/", "\\").replaceAll("\\\\", "\\") ===
        folder
    );

  // Populate rows with data
  folders.forEach((row) => {
    const newRow = worksheet.addRow([
      getChanges(row.folder)?.originalFolderPath ?? row.folder,
      getChanges(row.folder)?.newFolderPath ?? "",
      getChanges(row.folder)?.newFolderPath &&
      getChanges(row.folder)?.newFolderPath !== ""
        ? "Path Changed"
        : getChanges(row.folder)?.deleted
        ? "Removed"
        : "",
      row.schedule,
      row.classification,
      row.file,
      row.opr ? "Y" : "N",
      formatDate(row.startDate),
      formatDate(row.endDate),
      formatDate(row.soDate),
      formatDate(row.fdDate),
    ]);

    // Apply font styling to all cells in the row
    newRow.eachCell((cell) => {
      cell.font = { name: "BC Sans" };
    });
  });
};
