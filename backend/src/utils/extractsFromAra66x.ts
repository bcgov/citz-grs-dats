import ExcelJS from "exceljs";
import { ITransfer } from "../models/interfaces/ITransfer";

interface TransferData {
  accession: string;
  application: string;
  ministry: string;
  branch: string;
  folders: string[];
}

export default async function extractsFromAra66x(excelfile: string) {
  const wb = new ExcelJS.Workbook();

  try {
    await wb.xlsx.readFile(excelfile);

    const ws1 = wb.getWorksheet("CoverPage");

    if (!ws1) {
      console.log("Worksheet 'CoverPage' not found.");
      return null; // Return null if ws1 is not present
    }
    const accession = ws1.getCell("B4");
    const application = ws1.getCell("B5");
    const ministry = ws1.getCell("B2");
    const branch = ws1.getCell("B3");

    console.log("Accession Number: " + accession.text);
    console.log("Application Number: " + application.text);
    console.log("Ministry: " + ministry.text);
    console.log("Branch: " + branch.text);

    const transferData: TransferData = {
      accession: ws1.getCell("B4").text,
      application: ws1.getCell("B5").text,
      ministry: ws1.getCell("B2").text,
      branch: ws1.getCell("B3").text,
      folders: [],
    };

    const ws2 = wb.getWorksheet("DIGITAL FILE LIST");
    if (!ws2) {
      console.log("Worksheet 'DIGITAL FILE LIST' not found.");
      return null;
    }

    const a = ws2.getColumn("A");
    const folders: string[] = [];
    a.eachCell({ includeEmpty: false }, (cell) => {
      folders.push(cell.text);
    });

    transferData.folders = folders;

    return transferData;
  } catch (err: any) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("An unknown error occurred:", err);
    }
  }
}
