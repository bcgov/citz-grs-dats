import ExcelJS from "exceljs";
import { ITransfer } from "../models/interfaces/ITransfer";

interface TransferData {
  accession: string; //Cover Page
  application: string;
  ministry: string;
  branch: string;
  folders: string[]; //Digital File List
  schedules: string[];
  primaries: string[];
  fileIds: string[];
  fileTitles: string[];
  oprflags: string[];
  startDates: string[];
  endDates: string[];
  soDates: string[];
  finalDispositionDates: string[];
  objectPaths: string[]; //Technical Metadata V1
  objectFileNames: string[];
}

export default async function extractsDigitalFileList(excelfile: string) {
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

    const transferData: TransferData = {
      accession: ws1.getCell("B4").text,
      application: ws1.getCell("B5").text,
      ministry: ws1.getCell("B2").text,
      branch: ws1.getCell("B3").text,
      folders: [],
      schedules: [],
      primaries: [],
      fileIds: [],
      fileTitles: [],
      oprflags: [],
      startDates: [],
      endDates: [],
      soDates: [],
      finalDispositionDates: [],
      objectPaths: [],
      objectFileNames: [],
    };

    const ws2 = wb.getWorksheet("DIGITAL FILE LIST");
    if (!ws2) {
      console.log("Worksheet 'DIGITAL FILE LIST' not found.");
      return null;
    }

    ws2.spliceRows(0,1);
    const digitalFileListA = ws2.getColumn("A");
    const folders: string[] = [];
    digitalFileListA.eachCell({ includeEmpty: false }, (cell) => {
      folders.push(cell.text);
    });

    transferData.folders = folders;

    const digitalFileListB = ws2.getColumn("B");
    const schedules: string[] = [];
    digitalFileListB.eachCell({ includeEmpty: false }, (cell) => {
      schedules.push(cell.text);
    });

    transferData.schedules = schedules;

    const digitalFileListC = ws2.getColumn("C");
    const primaries: string[] = [];
    digitalFileListC.eachCell({ includeEmpty: false }, (cell) => {
      primaries.push(cell.text);
    });

    transferData.primaries = primaries;

    const digitalFileListD = ws2.getColumn("D");
    const fileIds: string[] = [];
    digitalFileListD.eachCell({ includeEmpty: false }, (cell) => {
      fileIds.push(cell.text);
    });

    transferData.fileIds = fileIds;

    const digitalFileListE = ws2.getColumn("E");
    const fileTitles: string[] = [];
    digitalFileListE.eachCell({ includeEmpty: false }, (cell) => {
      fileTitles.push(cell.text);
    });

    transferData.fileTitles = fileTitles;

    const digitalFileListF = ws2.getColumn("F");
    const oprflags: string[] = [];
    digitalFileListF.eachCell({ includeEmpty: false }, (cell) => {
      oprflags.push(cell.text);
    });

    transferData.oprflags = oprflags;

    const digitalFileListG = ws2.getColumn("G");
    const startDates: string[] = [];
    digitalFileListG.eachCell({ includeEmpty: false }, (cell) => {
      startDates.push(cell.text);
    });

    transferData.startDates = startDates;

    const digitalFileListH = ws2.getColumn("H");
    const endDates: string[] = [];
    digitalFileListH.eachCell({ includeEmpty: false }, (cell) => {
      endDates.push(cell.text);
    });

    transferData.endDates = endDates;

    const digitalFileListI = ws2.getColumn("I");
    const soDates: string[] = [];
    digitalFileListI.eachCell({ includeEmpty: false }, (cell) => {
      soDates.push(cell.text);
    });

    transferData.soDates = soDates;

    const digitalFileListJ = ws2.getColumn("J");
    const finalDispositionDates: string[] = [];
    digitalFileListJ.eachCell({ includeEmpty: false }, (cell) => {
      finalDispositionDates.push(cell.text);
    });

    transferData.finalDispositionDates = finalDispositionDates;

    const ws3 = wb.getWorksheet("Technical Metadata v1");
    if (!ws3) {
      console.log("Worksheet 'Technical Metadata v1' not found.");
      return null;
    }

    ws3.spliceRows(0,1);
    const objectsA = ws3.getColumn("A");
    const objectPaths: string[] = [];
    objectsA.eachCell({ includeEmpty: false }, (cell) => {
      objectPaths.push(cell.text);
    });

    transferData.objectPaths = objectPaths;

    const objectsB= ws3.getColumn("B");
    const objectFileNames: string[] = [];
    objectsB.eachCell({ includeEmpty: false }, (cell) => {
      objectFileNames.push(cell.text);
    });

    transferData.objectFileNames = objectFileNames;

    return transferData;
  } catch (err: any) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("An unknown error occurred:", err);
    }
  }
}

