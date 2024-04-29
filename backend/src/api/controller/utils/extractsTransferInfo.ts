import ExcelJS from "exceljs";
import { ITransfer } from "../../model/interfaces/ITransfer";

interface TransferData {
  accession: string;
  application: string;
}

export default async function extractsTransferInfo(excelfile: string) {
  const wb = new ExcelJS.Workbook();

  try {
    await wb.xlsx.readFile(excelfile);

    const ws1 = wb.getWorksheet("CoverPage");

    if (!ws1) {
      console.log("Worksheet 'CoverPage' not found.");
      return null; // Return null if ws1 is not present
    }
    // const accession = ws1.getCell("B4");
    // const application = ws1.getCell("B5");

    const transferData: TransferData = {
      accession: ws1.getCell("B4").text,
      application: ws1.getCell("B5").text,
    };


    return transferData;
  } catch (err: any) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("An unknown error occurred:", err);
    }
  }
}
