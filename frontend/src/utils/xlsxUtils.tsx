import * as XLSX from "xlsx";

export interface ExcelData {
  key: string;
  value: string;
}

export interface DatsExcelModel {
  applicationNumber: string;
  accessionNumber: string;
}
/**
 * Helper function to read an Excel file and extract data for given keys.
 * @param file - The Excel file object to read from.
 * @returns A promise that resolves to an array of key-value pairs.
 */
export const extractExcelData = (file: File): Promise<DatsExcelModel> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target?.result;
      if (binaryStr) {
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json<{ [key: string]: string }>(
          sheet,
          { header: 1 }
        );

        let appNumber = "";
        let accessionNumber = "";
        sheetData.forEach((row) => {
          if (row[0] === "Accession #") {
            accessionNumber = row[1];
          }
          if (row[0] === "Application #") {
            appNumber = row[1];
          }
        });
        const extractedData: DatsExcelModel = {
          accessionNumber: accessionNumber,
          applicationNumber: appNumber,
        };
        resolve(extractedData);
      } else {
        reject(new Error("Failed to read the file."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the file."));
    };

    reader.readAsBinaryString(file);
  });
};

export const extractDataport = (file: File): Promise<DatsExcelModel> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error("Failed to read the file."));
    };
    reader.onload = (e) => {
      debugger;
      const content = e.target?.result as string;
      const rows = content?.split("\n");
      let accessionNumber: string | null = null;
      let consignment: string | null = null;

      // Extract header columns
      const headers = rows[0].split("\t");
debugger;
      // Find index of Accession Number and Consignment (Application)
      const accessionIndex = headers.indexOf("Accession Number");
      const consignmentIndex = headers.indexOf("Consignment (Application)");

      // Loop through the rows to find the first non-empty value for each column
      for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split("\t");
        if (accessionNumber === null && columns[accessionIndex]) {
          accessionNumber = columns[accessionIndex];
        }
        if (consignment === null && columns[consignmentIndex]) {
          consignment = columns[consignmentIndex];
        }
        if (accessionNumber !== null && consignment !== null) {
          break;
        }
      }
      const extractedData: DatsExcelModel = {
        accessionNumber: accessionNumber!!,
        applicationNumber: consignment!!,
      };
      resolve(extractedData);
    };
    reader.readAsText(file);
  });
};
