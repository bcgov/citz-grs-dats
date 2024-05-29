import * as XLSX from 'xlsx';

export interface ExcelData {
  key: string;
  value: string;
}

export interface DatsExcelModel
{
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
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json<{ [key: string]: string }>(sheet, { header: 1 });

        let appNumber = '';
        let accessionNumber = '';
        sheetData.forEach((row) => {
          if (row[0] === 'Accession #') {
            accessionNumber = row[1];
          }
          if (row[0] === 'Application #') {
            appNumber = row[1];
          }
        });
        const extractedData : DatsExcelModel = { accessionNumber : accessionNumber, applicationNumber : appNumber};
        resolve(extractedData);
      } else {
        reject(new Error('Failed to read the file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };

    reader.readAsBinaryString(file);
  });
};
