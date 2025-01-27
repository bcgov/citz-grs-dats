import * as XLSX from "xlsx";
import { accessionExists, isAccessionValid } from "./accessionUtils";
import { applicationExists, isApplicationValid } from "./applicationUtils";

export const parseXlsxFileList = (
  file: File | null | undefined
): Promise<{
  accession: string;
  application: string;
  folders: string[];
}> => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("Missing filelist."));

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (event.target?.result) {
          const data = new Uint8Array(event.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const coverPage = workbook.Sheets["COVER PAGE"];
          const fileList = workbook.Sheets["FILE LIST"];

          if (!coverPage || !fileList)
            return reject(
              new Error('Missing on or more of ["COVER PAGE", "FILE LIST"].')
            );

          // Access cells
          const accession = coverPage?.B3?.v?.toString();
          const application = coverPage?.B4?.v?.toString();

          if (!(accessionExists(accession) && applicationExists(application)))
            return reject(new Error("Missing accession and/or application."));

          if (!(isAccessionValid(accession) && isApplicationValid(application)))
            return reject(new Error("Invalid accession and/or application."));

          // Extract folder names from column A starting at A2
          const folders: string[] = [];
          let rowIndex = 2; // Start at row 2 (A2)
          while (true) {
            const cellAddress = `A${rowIndex}`;
            const cell = fileList[cellAddress];
            if (cell?.v && cell?.v?.toString().trim() !== "") {
              folders.push(cell.v.toString());
              rowIndex++;
            } else {
              break; // Stop when an empty cell is encountered
            }
          }

          resolve({
            accession,
            application,
            folders,
          });
        }
      } catch (error) {
        reject(`${error}`);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read the file."));
    reader.readAsArrayBuffer(file);
  });
};
