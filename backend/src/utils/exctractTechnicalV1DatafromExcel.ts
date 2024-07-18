import ExcelJS from "exceljs";

interface RowData {
    [key: string]: any;
}

export default async function extractDataFromSheet(excelfile: Buffer) {

    const wb = new ExcelJS.Workbook();


    await wb.xlsx.load(excelfile);

    const ws = wb.getWorksheet('Technical Metadata v1');

    if (!ws) {
        throw new Error('Worksheet not found');
    }
    const rows: RowData[] = [];

    ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
            // Assuming the first row is the header
            return;
        }

        const rowData: RowData = {};
        row.eachCell((cell, colNumber) => {
            const headerCell = ws.getRow(1).getCell(colNumber);
            rowData[headerCell.value as string] = cell.value;
        });

        rows.push(rowData);
    });
    return rows;


}