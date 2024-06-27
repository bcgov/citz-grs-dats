import ExcelJS from "exceljs";

interface DigtalFileListData {
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
}

export default async function extractsDigitalFileList(excelfile: string) {
  const wb = new ExcelJS.Workbook();

  try {
    await wb.xlsx.readFile(excelfile);

    const digitalFileListData: DigtalFileListData = {
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

    digitalFileListData.folders = folders;

    const digitalFileListB = ws2.getColumn("B");
    const schedules: string[] = [];
    digitalFileListB.eachCell({ includeEmpty: false }, (cell) => {
      schedules.push(cell.text);
    });

    digitalFileListData.schedules = schedules;

    const digitalFileListC = ws2.getColumn("C");
    const primaries: string[] = [];
    digitalFileListC.eachCell({ includeEmpty: false }, (cell) => {
      primaries.push(cell.text);
    });

    digitalFileListData.primaries = primaries;

    const digitalFileListD = ws2.getColumn("D");
    const fileIds: string[] = [];
    digitalFileListD.eachCell({ includeEmpty: false }, (cell) => {
      fileIds.push(cell.text);
    });

    digitalFileListData.fileIds = fileIds;

    const digitalFileListE = ws2.getColumn("E");
    const fileTitles: string[] = [];
    digitalFileListE.eachCell({ includeEmpty: false }, (cell) => {
      fileTitles.push(cell.text);
    });

    digitalFileListData.fileTitles = fileTitles;

    const digitalFileListF = ws2.getColumn("F");
    const oprflags: string[] = [];
    digitalFileListF.eachCell({ includeEmpty: false }, (cell) => {
      oprflags.push(cell.text);
    });

    digitalFileListData.oprflags = oprflags;

    const digitalFileListG = ws2.getColumn("G");
    const startDates: string[] = [];
    digitalFileListG.eachCell({ includeEmpty: false }, (cell) => {
      startDates.push(cell.text);
    });

    digitalFileListData.startDates = startDates;

    const digitalFileListH = ws2.getColumn("H");
    const endDates: string[] = [];
    digitalFileListH.eachCell({ includeEmpty: false }, (cell) => {
      endDates.push(cell.text);
    });

    digitalFileListData.endDates = endDates;

    const digitalFileListI = ws2.getColumn("I");
    const soDates: string[] = [];
    digitalFileListI.eachCell({ includeEmpty: false }, (cell) => {
      soDates.push(cell.text);
    });

    digitalFileListData.soDates = soDates;

    const digitalFileListJ = ws2.getColumn("J");
    const finalDispositionDates: string[] = [];
    digitalFileListJ.eachCell({ includeEmpty: false }, (cell) => {
      finalDispositionDates.push(cell.text);
    });

    digitalFileListData.finalDispositionDates = finalDispositionDates;
    
    return digitalFileListData;

  } catch (err: any) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("An unknown error occurred:", err);
    }
  }
}

