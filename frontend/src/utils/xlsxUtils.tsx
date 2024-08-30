import * as XLSX from "xlsx";
import { IFolderInformation } from "../types/DTO/Interfaces/IFolderInformation";

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
        const secondSheetName = workbook.SheetNames[1]; // Get the second sheet
        if (!secondSheetName) {
          return reject('The second sheet does not exist.');
        }
        const ws = workbook.Sheets['Technical Metadata v1'];

        if (!ws) {
          reject(new Error("Technical Metadata v1 sheet is missing"));
        }

        if (!secondSheetName) {
          return reject('The second sheet does not exist.');
        }
        //ensure second column has value for every row
        const secondSheet = workbook.Sheets[secondSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any[]>(secondSheet, { header: 1 });
        for (const row of jsonData) {
          if (row.length > 0 && (row[2] === undefined || row[2] === null || row[2] === '')) {
            reject(new Error("Primary/Secondary value is missing"));
            return;
          }
        }

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
        if (accessionNumber === '' || appNumber === '' || accessionNumber === undefined || appNumber === undefined) {
          reject(new Error("Accession Number and/or Application number is missing"));
          return;
        }

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
export const readFileAsString = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error("Failed to read the file."));
    };
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      resolve(content);
    };
    reader.readAsText(file);
  });
}
export const extractDataport = (file: File): Promise<DatsExcelModel> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error("Failed to read the file."));
    };
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const rows = content?.split("\n");
      let accessionNumber: string | null = null;
      let consignment: string | null = null;

      // Extract header columns
      const headers = rows[0].split("\t");
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
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
export const generateExcel = async (folders: IFolderInformation[]) => {
  const response = await fetch(`/api/digital-file-list-template.xlsx`); // Adjust the path to your template file
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Assuming the template has 'Files' and 'Objects' sheets
  const filesSheet = workbook.Sheets[workbook.SheetNames[1]];
  const objectsSheet = workbook.Sheets[workbook.SheetNames[2]];


  const filesData = folders.map(folder => [
    folder.path,
    folder.schedule,
    folder.primarySecondary,
    folder.fileId,
    null,//file title
    folder.opr ? 'Y' : 'N',
    folder.startDate ? formatDate(folder.startDate) : null,
    folder.endDate ? formatDate(folder.endDate) : null,
    folder.soDate ? formatDate(folder.soDate) : null,
    folder.fdDate ? formatDate(folder.fdDate) : null
  ]);
  XLSX.utils.sheet_add_aoa(filesSheet, filesData, { origin: 'A2' }); // Add data starting from row 2 to leave headers intact


  const objectsData = folders.flatMap(folder =>
    folder.files.map(obj => [
      obj.path,
      obj.checksum,
      obj.name,
      obj.dateCreated ? { v: obj.dateCreated, t: 's' } : null,
      obj.dateModified ? { v: obj.dateModified, t: 's' } : null,
      obj.dateAccessed ? { v: obj.dateAccessed, t: 's' } : null,
      obj.dateLastSaved ? { v: obj.dateLastSaved, t: 's' } : null,
      obj.owner,
      obj.owner,
      obj.owner,
      obj.company,
      obj.computer,
      obj.contentType,
      obj.programName,
      obj.sizeInBytes,
      obj.revisionNumber,
    ])
  );

  XLSX.utils.sheet_add_aoa(objectsSheet, objectsData, { origin: 'A2' }); // Add data starting from row 2 to leave headers intact


  // Write to file
  XLSX.writeFile(workbook, 'Workbook.xlsx');
};
