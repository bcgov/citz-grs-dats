import * as XLSX from "xlsx";
import { accessionExists, isAccessionValid } from "./accessionUtils";
import { applicationExists, isApplicationValid } from "./applicationUtils";

export const parseXlsxFileList = (
  file: File | null | undefined
): Promise<{
  accession: string;
  application: string;
  folders: string[];
  foldersMetadata: Record<string, unknown>;
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

          const fileListSheetName = workbook.SheetNames.find((name) =>
            name.startsWith("FILE LIST")
          );

          if (!coverPage || !fileListSheetName)
            return reject(
              new Error('Missing on or more of ["COVER PAGE", "FILE LIST"].')
            );

          const fileList = workbook.Sheets[fileListSheetName];

          // Access cells
          const accession = coverPage?.B3?.v?.toString();
          const application = coverPage?.B4?.v?.toString();

          if (!(accessionExists(accession) && applicationExists(application)))
            return reject(new Error("Missing accession and/or application."));

          if (!(isAccessionValid(accession) && isApplicationValid(application)))
            return reject(new Error("Invalid accession and/or application."));

          // Extract folder names from column A starting at A2
          const folders: string[] = [];
          const foldersMetadata: Record<string, unknown> = {};

          let rowIndex = 2; // Start at row 2 (A2)
          while (true) {
            const folderName = fileList[`A${rowIndex}`]?.v?.toString();
            if (!folderName) break;

            if (folders.includes(folderName))
              return reject(new Error("Duplicate folder in file list."));

            folders.push(folderName);

            foldersMetadata[folderName] = {
              schedule: fileList[`B${rowIndex}`]?.v ?? null,
              classification: fileList[`C${rowIndex}`]?.v ?? null,
              file: fileList[`D${rowIndex}`]?.v ?? null,
              opr: fileList[`E${rowIndex}`]?.v === "Y",
              startDate: fileList[`F${rowIndex}`]?.v ?? null,
              endDate: fileList[`G${rowIndex}`]?.v ?? null,
              soDate: fileList[`H${rowIndex}`]?.v ?? null,
              fdDate: fileList[`I${rowIndex}`]?.v ?? null,
            };

            rowIndex++;
          }

          if (folders.length === 0)
            return reject(new Error("Folders is empty."));

          const foldersMissingScheduleOrClassification = Object.values(
            foldersMetadata
          ).some((f) => {
            const folder = f as unknown as {
              schedule: string;
              classification: string;
            };
            return folder.schedule === "" || folder.classification === "";
          });

          if (foldersMissingScheduleOrClassification) {
            return reject(
              new Error("Folders is missing schedule and/or classification.")
            );
          }

          resolve({
            accession,
            application,
            folders,
            foldersMetadata,
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
