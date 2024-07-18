import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

interface RowData {
    [key: string]: any;
}

async function createTechnicalV2fromJson(jsonData: RowData[], filePath: Buffer,): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Load the existing Excel file if it exists, otherwise create a new workbook
    if (fs.existsSync(filePath)) {
        await workbook.xlsx.load(filePath);
    }

    // Add a new sheet to the workbook
    const worksheet = workbook.addWorksheet("Technical Metadata v2");

    if (jsonData.length === 0) {
        throw new Error('JSON data is empty');
    }

    // Extract the headers from the first row of JSON data
    const headers = Object.keys(jsonData[0]);
    worksheet.addRow(headers);

    // Add the JSON data to the worksheet
    jsonData.forEach((rowData) => {
        const row = headers.map((header) => rowData[header]);
        worksheet.addRow(row);
    });

    const newBuffer = await workbook.xlsx.writeBuffer();
    console.log(`Sheet  has been created in the buffer`);
    return newBuffer as Buffer;
}

// Example usage
// const jsonFilePath = path.join(__dirname, 'technical_metadata.json');
// const excelFilePath = '/mnt/data/ars661-template-test-jl1.xlsx';
// const newSheetName = 'Technical Metadata v2';

// // Read the JSON file
// fs.readFile(jsonFilePath, 'utf8', (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   const jsonData: RowData[] = JSON.parse(data);
//   jsonToExcel(jsonData, excelFilePath, newSheetName).catch(console.error);
// });
