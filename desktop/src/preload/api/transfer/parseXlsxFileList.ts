import * as XLSX from "xlsx";

export const parseXlsxFileList = (
  fileList: File | null | undefined
): Promise<{
  accession: string;
  application: string;
  folders: string[];
  foldersMetadata: Record<string, unknown>;
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
              const foldersMetadata: Record<string, unknown> = {};

              let rowIndex = 2; // Start at row 2 (A2)
              while (true) {
                const folderName = fileList[`A${rowIndex}`]?.v?.toString();
                if (!folderName) break;

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

              if (accessionCell && applicationCell) {
                resolve({
                  accession: accessionCell.toString(),
                  application: applicationCell.toString(),
                  folders,
                  foldersMetadata,
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
