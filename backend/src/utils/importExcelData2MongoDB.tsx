const excelToJson = require("convert-excel-to-json");
const fs = require("fs");

export default async function importExcelData2MongoDB(filePath) {
  //   try {
  console.log("importExcelData2MongoDB");
  // const excelData = await excelToJson({
  //   sourceFile: filePath?.path,
  //   sheets: [
  //     {
  //       name: filePath.filename.split(".")[0],
  //       header: {
  //         rows: 1, // no/s. of the row that has headers in your excel sheet
  //       },
  //       columnToKey: {
  //         A: "Ministry", //these attributes should be similar to the ones in your excel file
  //         B: "Branch",
  //         C: "Accession #",
  //         D: "Application #",
  //       },
  //     },
  //   ],
  // });
  const result = excelToJson({
    sourceFile: filePath?.path,
    sheets: ["CoverPage", "DIGITAL FILE LIST"],
  });
  console.log(result);
  return result;

  //     const sheetName = filePath.filename.split(".")[0]; // Update the sheet name

  //     if (!excelData[sheetName] || excelData[sheetName].length === 0) {
  //       throw new Error(`No data found in the '${sheetName}' sheet.`);
  //     } else {
  //       return excelData;
  //       // const client = await MongoClient.connect(url, { useNewUrlParser: true });
  //       // console.log("Connected to MongoDB");

  //       // const db = client.db("<database_name>");
  //       // const collection = db.collection("<collection_name>");

  //       // const result = await collection.insertMany(excelData[sheetName]);
  //       // console.log("Number of documents inserted:", result.insertedCount);

  //       // client.close();
  //       fs.unlinkSync(filePath?.path);
  //     }
  //   } catch (err) {
  //     console.log("Error importing data to MongoDB:", err);
  //     throw err;
}
