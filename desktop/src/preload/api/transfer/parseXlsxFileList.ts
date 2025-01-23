import * as XLSX from "xlsx";
import { isAccessionValid } from "./isAccessionValid";
import { isApplicationValid } from "./isApplicationValid";

export const parseXlsxFileList = (
  fileList: File | null | undefined
): Promise<{
  accession: string;
  application: string;
  folders: string[];
} | null> => {
  return new Promise((resolve, reject) => {
    if (fileList) {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            const data = new Uint8Array(event.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const coverPage = workbook.Sheets["COVER PAGE"];
            const fileList = workbook.Sheets["FILE LIST"];

            if (coverPage && fileList) {
              // Access specific cells
              const accessionCell = coverPage.B3?.v; // B3 cell value
              const applicationCell = coverPage.B4?.v; // B4 cell value

              // Extract folder names from column A starting at A2
              const folders: string[] = [];
              let rowIndex = 2; // Start at row 2 (A2)
              while (true) {
                const cellAddress = `A${rowIndex}`;
                const cell = fileList[cellAddress];
                if (cell?.v) {
                  folders.push(cell.v.toString());
                  rowIndex++;
                } else {
                  break; // Stop when an empty cell is encountered
                }
              }

              if (
                accessionCell &&
                applicationCell &&
                isAccessionValid(accessionCell.toString()) &&
                isApplicationValid(applicationCell.toString())
              ) {
                resolve({
                  accession: accessionCell.toString(),
                  application: applicationCell.toString(),
                  folders,
                });
              } else {
                resolve(null); // One or both cells are empty
              }
            } else {
              reject(new Error("Sheet not found in the Excel file."));
            }
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read the file."));
      };

      reader.readAsArrayBuffer(fileList);
    } else {
      resolve(null);
    }
  });
};
