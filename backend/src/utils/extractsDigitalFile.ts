import ExcelJS from "exceljs";

interface DigtalFileListData {
  folders: string[]; //Digital File List
  objectPaths: string[]; //Technical Metadata V1
  fileNames: string[];
  sha256Checusums: string[];
  createdDates: string[];
  lastModifiedDates: string[];
  lastAccessedDates: string[];
  authors: string[];
  owners: string[];
  companies: string[];
  computers: string[];
  contentTypes: string[];
  programNames: string[];
  sizes: string[];
  revisionNumbers: string[];
}

export default async function extractsDigitalFileList(excelfile: string) {
  const wb = new ExcelJS.Workbook();

  try {
    const digitalFileListData: DigtalFileListData = {
            folders: [], //Digital File List
            objectPaths: [], //Technical Metadata V1
            fileNames: [],
            sha256Checusums: [],
            createdDates: [],
            lastModifiedDates: [],
            lastAccessedDates: [],
            authors: [],
            owners: [],
            companies: [],
            computers: [],
            contentTypes: [],
            programNames: [],
            sizes: [],
            revisionNumbers: [],
    };

    await wb.xlsx.readFile(excelfile);

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

    digitalFileListData.objectPaths = objectPaths;

    const objectsB= ws3.getColumn("B");
    const fileNames: string[] = [];
    objectsB.eachCell({ includeEmpty: false }, (cell) => {
      fileNames.push(cell.text);
    });

    digitalFileListData.fileNames = fileNames;

    const objectC= ws3.getColumn("C");
    const sha256Checusums: string[] = [];
    objectC.eachCell({ includeEmpty: false }, (cell) => {
      sha256Checusums.push(cell.text);
    });

    digitalFileListData.sha256Checusums = sha256Checusums;

    const objectD= ws3.getColumn("D");
    const createdDates: string[] = [];
    objectD.eachCell({ includeEmpty: false }, (cell) => {
      createdDates.push(cell.text);
    });

    digitalFileListData.createdDates = createdDates;
    
    const objectE= ws3.getColumn("E");
    const lastModifiedDates: string[] = [];
    objectE.eachCell({ includeEmpty: false }, (cell) => {
      lastModifiedDates.push(cell.text);
    });

    digitalFileListData.lastModifiedDates = lastModifiedDates;


    const objectF = ws3.getColumn("F");
    const lastAccessedDates: string[] = [];
    objectF.eachCell({ includeEmpty: false }, (cell) => {
      lastAccessedDates.push(cell.text);
    });

    digitalFileListData.lastAccessedDates = lastAccessedDates;


    const objectG = ws3.getColumn("G");
    const authors: string[] = [];
    objectG.eachCell({ includeEmpty: false }, (cell) => {
      authors.push(cell.text);
    });

    digitalFileListData.authors = authors;

    const objectH = ws3.getColumn("H");
    const owners: string[] = [];
    objectH.eachCell({ includeEmpty: false }, (cell) => {
      owners.push(cell.text);
    });

    digitalFileListData.owners = owners;

    const objectI = ws3.getColumn("I");
    const companies: string[] = [];
    objectI.eachCell({ includeEmpty: false }, (cell) => {
      companies.push(cell.text);
    });

    digitalFileListData.companies = companies;

    const objectJ = ws3.getColumn("J");
    const computers: string[] = [];
    objectJ.eachCell({ includeEmpty: false }, (cell) => {
      computers.push(cell.text);
    });

    digitalFileListData.computers = computers;

    const objectK = ws3.getColumn("K");
    const contentTypes: string[] = [];
    objectK.eachCell({ includeEmpty: false }, (cell) => {
      contentTypes.push(cell.text);
    });

    digitalFileListData.contentTypes = contentTypes;

    const objectL = ws3.getColumn("L");
    const programNames: string[] = [];
    objectL.eachCell({ includeEmpty: false }, (cell) => {
      programNames.push(cell.text);
    });

    digitalFileListData.programNames = programNames;

    const objectM = ws3.getColumn("M");
    const sizes: string[] = [];
    objectM.eachCell({ includeEmpty: false }, (cell) => {
      sizes.push(cell.text);
    });

    digitalFileListData.sizes = sizes;

    const objectN = ws3.getColumn("N");
    const revisionNumbers: string[] = [];
    objectN.eachCell({ includeEmpty: false }, (cell) => {
      revisionNumbers.push(cell.text);
    });

    digitalFileListData.revisionNumbers = revisionNumbers;

    return digitalFileListData;
    
  } catch (err: any) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("An unknown error occurred:", err);
    }
  }
}

