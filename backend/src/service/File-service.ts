import PDFDocument from "pdfkit";
import XLSX from "xlsx";
import SambaClient from "samba-client";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import S3ClientService from "../service/s3Client-service";
import TransferService from "../service/transfer-service";
import TransferRepository from "../repository/transfer-repository";
import validateBufferChecksum from "../utils/validateBufferChecksum";
import calculateHash from "../utils/calculateHash";
import { IPsp } from "src/models/psp-model";
import { TransferStatus } from "../models/enums/TransferStatus";
import logger from "../config/logs/winston-config";
import { ITransfer } from "src/models/transfer-model";
import { IDigitalFileList } from "src/models/digitalFileList-model";
import { config, sftp } from "../config/ssh2-sftp-client";

const replacePlaceholders = (
  text: string,
  placeholders: { [key: string]: string }
): string => {
  let replacedText = text;
  for (const [key, value] of Object.entries(placeholders)) {
    replacedText = replacedText.replace(new RegExp(`\\[${key}\\]`, "g"), value);
  }
  return replacedText;
};

interface Placeholder {
  [key: string]: string;
}
export default class FileService {
  private s3ClientService: S3ClientService;
  private transferService: TransferService;
  private transferRepository: TransferRepository;

  constructor() {
    this.s3ClientService = new S3ClientService();
    this.transferService = new TransferService();
    this.transferRepository = new TransferRepository();
  }
  async createNote(notes: string, placeholders: Placeholder): Promise<string> {
    const accession_num = placeholders["AccessionNumber"];
    const application_num = placeholders["ApplicationNumber"];

    const transferFolderPath = process.env.TRANSFER_FOLDER_NAME || "Transfers";
    const targetNotePath = `${transferFolderPath}/${accession_num}-${application_num}/Documentation/note_${Date.now()}.txt`;
    logger.debug(`uploaded note path ${targetNotePath}`);
    await this.s3ClientService.uploadDocumentationToS3(
      Buffer.from(notes),
      targetNotePath
    );
    return targetNotePath;
  }

  async createAgreementPDF(
    agreementText: any[],
    status: string,
    decision: string,
    placeholders: Placeholder
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(buffers);

        const accession_num = placeholders["AccessionNumber"];
        const application_num = placeholders["ApplicationNumber"];

        const transferFolderPath =
          process.env.TRANSFER_FOLDER_NAME || "Transfers";
        const targetPdfPath = `${transferFolderPath}/${accession_num}-${application_num}/Documentation/agreement_${Date.now()}.pdf`;
        console.log("in createAgreementPDF " + targetPdfPath);

        try {
          await this.s3ClientService.uploadDocumentationToS3(
            pdfBuffer,
            targetPdfPath
          );
          resolve(targetPdfPath);
        } catch (error) {
          reject(error);
        }
      });

      // Add your logo (uncomment and provide the correct path to the logo if needed)
      // doc.image('backend/src/utils/BClogo/BCID_H_rgb_rev.e68ccb04.png', {
      //     fit: [250, 250],
      //     align: 'center',
      //     valign: 'top'
      // }).moveDown();

      // Add agreement text sections
      agreementText.forEach((section) => {
        const replacedContent = replacePlaceholders(
          section.content,
          placeholders
        );
        doc
          .fontSize(section.isTitle ? 14 : 12)
          .font(section.isTitle ? "Helvetica-Bold" : "Helvetica")
          .text(replacedContent, { align: section.isTitle ? "center" : "left" })
          .moveDown();
      });

      doc.fontSize(12).text(`Status: ${status}`, { align: "left" });
      doc.moveDown();
      doc.fontSize(12).text(`Decision: ${decision}`, { align: "left" });

      doc.end();
    });
  }

  /**
   * Orchestrates the creation of PSPs for a given transfer.
   * Fetches the transfer, processes each PSP, and updates the transfer status.
   * @param transferId - The ID of the transfer for which PSPs are to be created.
   * @returns A promise that resolves to a success message upon completion.
   */
  async createPSPs(transferId: string): Promise<string> {
    try {
      const transfer = await this.transferRepository.getTransferWithPsps(
        transferId
      );

      if (!transfer) {
        throw new Error("Transfer not found");
      }
      // add the Admin Data json to the /metadatas folder

      const admintransferJson = JSON.stringify(transfer, null, 2);

      const transferBuffer = Buffer.from(admintransferJson, "utf-8");
      const subApplicationPath =
        transfer.accessionNumber + "-" + transfer.applicationNumber + "/";
      this.s3ClientService.saveToS3Metadatas(
        transferBuffer,
        "AdminMetadata.json",
        subApplicationPath
      );

      if (transfer.psps && Array.isArray(transfer.psps)) {
        const psps = transfer.psps as unknown as IPsp[];

        const transferFolderPath = this.getTransferFolderPath(transfer);

        await this.processPSPs(psps, transferFolderPath);
      } else {
        console.log("No PSPs found for this transfer.");
      }

      await this.markTransferAsComplete(transferId, transfer);

      console.log("PSP folders moved successfully");
      return "PSP folders created successfully";
    } catch (error) {
      console.error("Error moving PSP folders:", error);
      throw error;
    }
  }

  /**
   * Constructs the folder path for the transfer based on its accession number and application number.
   * @param transfer - The transfer object for which the folder path is generated.
   * @returns The constructed folder path as a string.
   */
  private getTransferFolderPath(transfer: ITransfer): string {
    return `Tr_${transfer.accessionNumber}_${transfer.applicationNumber}/`;
  }

  /**
   * Processes each PSP in the transfer by zipping, hashing, uploading, and saving the hash as a JSON file.
   * @param psps - An array of PSP objects to process.
   * @param transferFolderPath - The base folder path where files will be uploaded in S3.
   */
  private async processPSPs(
    psps: IPsp[],
    transferFolderPath: string
  ): Promise<void> {
    if (!psps || psps.length === 0) return;

    await Promise.all(
      psps.map(async (psp) => {
        if (psp.pathToS3) {
          await this.handlePSP(psp, transferFolderPath);
        }
      })
    );
  }
  /**
   * Handles the process for a single PSP, including zipping, hashing, uploading, and saving the hash as a JSON file.
   * @param psp - The PSP object to process.
   * @param transferFolderPath - The base folder path where files will be uploaded in S3.
   */
  private async handlePSP(
    psp: IPsp,
    transferFolderPath: string
  ): Promise<void> {
    if (!psp.pathToS3) {
      throw new Error(`PSP path is undefined for PSP: ${psp.name}`);
    }

    const zipBuffer = await this.s3ClientService.copyPSPFolderFromS3ToZip(
      psp.pathToS3
    );
    if (!zipBuffer) {
      console.log(`No zip buffer created for PSP: ${psp.name}`);
      return;
    }

    const filePath = `${psp.name}.zip`;
    const zipBufferHash = await this.calculateHashForBuffer(zipBuffer);

    await this.uploadPSP(zipBuffer, filePath, transferFolderPath);
    await this.savePSPHashToJson(filePath, zipBufferHash, transferFolderPath);

    console.log(`File ${filePath} saved successfully!`);
  }
  /**
   * Calculates the hash of the provided buffer using the specified algorithm.
   * @param buffer - The buffer (e.g., ZIP file) for which the hash is calculated.
   * @returns A promise that resolves to the hash as a string.
   */
  private async calculateHashForBuffer(buffer: Buffer): Promise<string> {
    return calculateHash(buffer, "sha1") as unknown as string;
  }

  /**
   * Uploads the provided ZIP buffer to S3 at the specified file path.
   * @param zipBuffer - The buffer containing the ZIP file data.
   * @param filePath - The file path in S3 where the ZIP file will be uploaded.
   * @param transferFolderPath - The base folder path where files will be uploaded in S3.
   */
  private async uploadPSP(
    zipBuffer: Buffer,
    filePath: string,
    transferFolderPath: string
  ): Promise<void> {
    await this.uploadPSPtoLanWithSftp(zipBuffer, filePath, transferFolderPath);
    await this.s3ClientService.uploadPSPToS3(
      zipBuffer,
      filePath,
      transferFolderPath
    );
  }

  private async uploadPSPtoLanWithSftp(
    buffer: Buffer,
    targetFilePath: string,
    transferFolderPath: string
  ): Promise<void> {
    try {
      await sftp.connect(config);

      const remoteFilePath = process.env.LAN_FTP_SERVER_REMOTE_PATH ?? "/dev";
      await sftp.mkdir(`${remoteFilePath}/${transferFolderPath}`);

      // Upload
      await sftp.put(
        buffer,
        `${remoteFilePath}/${transferFolderPath}/${targetFilePath}`
      );

      console.log(
        "PSP uploaded (using SFTP) successfully to",
        `${remoteFilePath}/${transferFolderPath}/${targetFilePath}`
      );
    } catch (error) {
      console.error("Error uploading PSP using SFTP", error);
      throw error;
    } finally {
      setTimeout(async () => {
        await sftp.end();
      }, 100);
    }
  }

  /**
   * Saves the hash of the ZIP file as a JSON file in S3 with a .checksum.json extension.
   * @param filePath - The original file path of the ZIP file.
   * @param zipBufferHash - The calculated hash of the ZIP file.
   * @param transferFolderPath - The base folder path where files will be uploaded in S3.
   */
  private async savePSPHashToJson(
    filePath: string,
    zipBufferHash: string,
    transferFolderPath: string
  ): Promise<void> {
    // const checksumFilePath = `${transferFolderPath}${filePath.replace('.zip', '.checksum.json')}`;
    await this.s3ClientService.savePspHashToJson(
      filePath,
      zipBufferHash,
      transferFolderPath
    );
  }

  /**
   * Updates the transfer's status to "PSPcomplete" and saves the changes to the repository.
   * @param transferId - The ID of the transfer to update.
   * @param transfer - The transfer object to be updated.
   */
  private async markTransferAsComplete(
    transferId: string,
    transfer: ITransfer
  ): Promise<void> {
    transfer.transferStatus = TransferStatus.PSPcomplete;
    await this.transferRepository.updateTransfer(transferId, transfer);
  }

  private async sendBufferToSMBShare(buffer: Buffer, fileName: string) {
    const smbClient = new SambaClient({
      address:
        process.env.SMB_ARCHIVE_LAND_DRIVE ||
        "\\\\cumulus.idir.bcgov\\Digital-Archives",
      username: process.env.SMB_ARCHIVE_LAND_USER || "",
      password: process.env.SMB_ARCHIVE_LAND_PASSWORD || "",
      domain: process.env.SMB_ARCHIVE_LAND_DOMAIN || "IDIR",
    });

    const remoteFilePath = `${fileName}`;

    // Define a temporary local file path
    const tempFilePath = join(tmpdir(), fileName);

    try {
      // Write the buffer to a temporary file
      await fs.writeFile(tempFilePath, buffer);

      // Send the temporary file to the SMB share
      await smbClient.sendFile(tempFilePath, remoteFilePath);

      console.log("File successfully sent to SMB share.");
    } catch (err) {
      console.error("Failed to send file to SMB share:", err);
      throw err; // Re-throw the error to propagate it
    } finally {
      // Clean up the temporary file
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupErr) {
        console.warn("Failed to clean up temporary file:", cleanupErr);
      }
    }
  }
  /**
   * Save folder details to S3, validate checksums, and prepare PSPs.
   *
   * @param file - The file buffer to be saved.
   * @param receivedChecksum - The checksum received for validation.
   * @param transferId - The ID of the transfer.
   * @param applicationNumber - The application number for the transfer.
   * @param accessionNumber - The accession number for the transfer.
   * @param primarySecondary - Indicates primary or secondary classification.
   * @param techMetadatav2 - Technical metadata version 2 for the transfer.
   */
  async saveFolderDetails(
    file: any,
    receivedChecksum: string,
    transferId: string,
    applicationNumber: string,
    accessionNumber: string,
    primarySecondary: string,
    techMetadatav2: any
  ): Promise<void> {
    // Replace single backslashes \ with double backslashes \\
    const techMetadatav2Parse = techMetadatav2.replace(/\\/g, "\\\\");

    // Parse the JSON string
    const techMetadatav2Array = JSON.parse(techMetadatav2Parse);

    // Step 1: Validate all required inputs are provided
    this.validateInputs(
      file,
      receivedChecksum,
      applicationNumber,
      accessionNumber,
      primarySecondary
    );

    // Step 2: Validate the checksum of the provided file
    await this.validateFileChecksum(file, receivedChecksum);

    // Step 3: setup the Transfer path
    const transferFolderPath = process.env.TRANSFER_FOLDER_NAME || "Transfers"; // Default folder name if not set

    // Step 4: Prepare the PSP name and path
    const { pspname, psppath } = this.preparePSPPath(
      accessionNumber,
      applicationNumber,
      primarySecondary,
      transferFolderPath
    );

    // Step 5: Create a folder in S3 for the PSP
    await this.s3ClientService.createFolder(psppath);

    // Step 6: Upload the zip file to S3 and save the checksum
    const zipFilePath = await this.s3ClientService.uploadZipFile(
      file,
      receivedChecksum,
      psppath
    );

    // Step 7: Upload the technical metadata (v2) to S3
    await this.s3ClientService.uploadTechnicalV2File(
      techMetadatav2Array,
      zipFilePath
    );

    // Step 8: Prepare the PSP data to be associated with the transfer
    const pspData: Partial<IPsp> = {
      name: pspname,
      pathToS3: psppath,
      pathToLan: " ", // Placeholder for LAN path if needed in the future
      pspStatus: "To be Create", // Initial status of the PSP
    };

    // Step 9: Add the PSP to the transfer and handle the result
    await this.addPspToTransfer(
      accessionNumber,
      applicationNumber,
      pspname,
      pspData
    );
  }

  /**
   * Validates that all required inputs are present.
   *
   * @param file - The file buffer to be saved.
   * @param receivedChecksum - The checksum received for validation.
   * @param applicationNumber - The application number for the transfer.
   * @param accessionNumber - The accession number for the transfer.
   * @param primarySecondary - Indicates primary or secondary classification.
   */
  private validateInputs(
    file: Buffer,
    receivedChecksum: string,
    applicationNumber: string,
    accessionNumber: string,
    primarySecondary: string
  ): void {
    if (
      !file ||
      !receivedChecksum ||
      !applicationNumber ||
      !accessionNumber ||
      !primarySecondary
    ) {
      throw new Error(
        "File, checksum, transferId, applicationNumber, accessionNumber, or classification missing"
      );
    }
  }
  /**
   * Validates the checksum of the provided file.
   *
   * @param file - The file buffer to validate.
   * @param receivedChecksum - The checksum received for validation.
   */
  private async validateFileChecksum(
    file: Buffer,
    receivedChecksum: string
  ): Promise<void> {
    const isValid = await validateBufferChecksum(
      file,
      receivedChecksum,
      "sha1"
    );
    if (!isValid) {
      throw new Error("Checksum mismatch. File validation failed.");
    }
  }

  /**
   * Retrieves the transfer details based on accession and application numbers.
   *
   * @param accessionNumber - The accession number for the transfer.
   * @param applicationNumber - The application number for the transfer.
   * @returns - The transfer object if found.
   */
  private async getTransfer(
    accessionNumber: string,
    applicationNumber: string
  ): Promise<ITransfer> {
    const transfer = await this.transferRepository.getTransferByKeysNumbers(
      accessionNumber,
      applicationNumber
    );
    if (!transfer) {
      throw new Error("Transfer not found");
    }
    console.log("In the transfer:", transfer);
    return transfer;
  }

  /**
   * Prepares the PSP name and path.
   *
   * @param accessionNumber - The accession number for the transfer.
   * @param applicationNumber - The application number for the transfer.
   * @param primarySecondary - Indicates primary or secondary classification.
   * @param transferFolderPath - The base folder path for the transfer.
   * @returns - An object containing the PSP name and path.
   */
  private preparePSPPath(
    accessionNumber: string,
    applicationNumber: string,
    primarySecondary: string,
    transferFolderPath: string
  ): { pspname: string; psppath: string } {
    const pspname = `PSP-${accessionNumber}-${applicationNumber}-${primarySecondary}-01`;
    const psppath = `${transferFolderPath}/${accessionNumber}-${applicationNumber}/${pspname}/`;
    return { pspname, psppath };
  }

  /**
   * Adds the PSP data to the transfer and logs the result.
   *
   * @param accessionNumber - The accession number for the transfer.
   * @param applicationNumber - The application number for the transfer.
   * @param pspname - The name of the PSP.
   * @param pspData - The PSP data to be added to the transfer.
   */
  private async addPspToTransfer(
    accessionNumber: string,
    applicationNumber: string,
    pspname: string,
    pspData: Partial<IPsp>
  ): Promise<void> {
    try {
      const updatedTransfer = await this.transferService.addPspToTransfer(
        accessionNumber,
        applicationNumber,
        pspname,
        pspData
      );
      console.log("Updated Transfer:", updatedTransfer);
    } catch (error) {
      throw new Error("Error adding PSP to Transfer:");
    }
  }

  /**
   * Downloads and updates the ARIS 662 Excel file for a specific transfer.
   * It retrieves the `techMetadatav2.json` files, appends them to the Excel file,
   * updates the 'DIGITAL FILE LIST' sheet, and uploads the updated file back to S3.
   * @param applicationNumber - The application number associated with the transfer.
   * @param accessionNumber - The accession number associated with the transfer.
   * @returns A promise that resolves to the updated Excel file buffer.
   */
  async downloadUpdateAris662(
    accessionNumber: string,
    applicationNumber: string
  ): Promise<Buffer> {
    try {
      const transferFolder = this.getTransferFolder();
      const prefix = this.constructS3Prefix(
        transferFolder,
        accessionNumber,
        applicationNumber
      );

      const techMetadataFiles = await this.fetchTechMetadataFiles(prefix);
      const concatenatedTechMetadata = await this.concatenateTechMetadataFiles(
        techMetadataFiles
      );

      const excelBuffer = await this.fetchExcelFileFromS3(
        accessionNumber,
        applicationNumber
      );
      const workbook = this.readExcelBufferToWorkbook(excelBuffer);

      this.appendTechMetadataToWorkbook(workbook, concatenatedTechMetadata);

      await this.updateDigitalFileListSheet(
        workbook,
        accessionNumber,
        applicationNumber
      );

      const updatedExcelBuffer = this.convertWorkbookToBuffer(workbook);
      const newS3Key = `${transferFolder}${accessionNumber}-${applicationNumber}/Documentation/Update_Aris662-${accessionNumber}_${applicationNumber}.xlsx`;

      await this.s3ClientService.uploadUpdatedArris662ToS3(
        updatedExcelBuffer,
        newS3Key
      );
      console.log("Excel file sent to client.");

      return updatedExcelBuffer;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("An error occurred while processing your request.");
    }
  }

  /**
   * Retrieves the transfer folder path from the environment variables.
   * @returns The transfer folder path.
   */
  private getTransferFolder(): string {
    return `${process.env.TRANSFER_FOLDER_NAME || "Transfers"}/`;
  }

  /**
   * Constructs the S3 prefix for a specific transfer.
   * @param transferFolderPath - The base folder path in S3.
   * @param accessionNumber - The accession number associated with the transfer.
   * @param applicationNumber - The application number associated with the transfer.
   * @returns The S3 prefix to search for `techMetadatav2.json` files.
   */
  private constructS3Prefix(
    transferFolderPath: string,
    accessionNumber: string,
    applicationNumber: string
  ): string {
    return `${transferFolderPath}${accessionNumber}-${applicationNumber}/`;
  }

  /**
   * Fetches the `techMetadatav2.json` files from S3 for a specific transfer.
   * @param prefix - The S3 prefix to search for the files.
   * @returns A promise that resolves to an array of file keys.
   */
  private async fetchTechMetadataFiles(prefix: string): Promise<string[]> {
    console.log(`Listing techMetadatav2.json files with prefix: ${prefix}`);
    const techMetadataFiles =
      await this.s3ClientService.listFilesInS3WithPrefix(
        prefix,
        "techMetadatav2.json"
      );
    if (techMetadataFiles.length === 0) {
      console.log("No techMetadatav2.json files found.");
      throw new Error("No techMetadatav2.json files found.");
    }
    console.log(`Found ${techMetadataFiles.length} techMetadatav2.json files.`);
    return techMetadataFiles;
  }

  /**
   * Downloads and concatenates the contents of the `techMetadatav2.json` files.
   * @param techMetadataFiles - An array of S3 file keys pointing to `techMetadatav2.json` files.
   * @returns A promise that resolves to the concatenated JSON data.
   */
  private async concatenateTechMetadataFiles(
    techMetadataFiles: string[]
  ): Promise<any[]> {
    let concatenatedTechMetadata: any[] = [];
    for (const fileKey of techMetadataFiles) {
      console.log(`Downloading file from S3: ${fileKey}`);
      const jsonData = await this.s3ClientService.downloadJsonFromS3(fileKey);
      concatenatedTechMetadata = concatenatedTechMetadata.concat(jsonData);
    }
    console.log(
      `Concatenated techMetadatav2 JSON data: ${JSON.stringify(
        concatenatedTechMetadata,
        null,
        2
      )}`
    );
    return concatenatedTechMetadata;
  }

  /**
   * Fetches the Excel file from S3 for a specific transfer.
   * @param accessionNumber - The accession number associated with the transfer.
   * @param applicationNumber - The application number associated with the transfer.
   * @returns A promise that resolves to the Excel file buffer.
   */
  private async fetchExcelFileFromS3(
    accessionNumber: string,
    applicationNumber: string
  ): Promise<Buffer> {
    const excelBuffer = await this.s3ClientService.getExcelFileFromS3(
      process.env.AWS_DATS_S3_BUCKET as string,
      process.env.TRANSFER_FOLDER_NAME as string,
      accessionNumber,
      applicationNumber
    );
    if (!excelBuffer) {
      console.log("Failed to retrieve the Excel file.");
      throw new Error("Failed to retrieve the Excel file.");
    }
    console.log("Excel file retrieved successfully.");
    return excelBuffer;
  }

  /**
   * Reads an Excel buffer into a workbook object.
   * @param excelBuffer - The buffer of the Excel file.
   * @returns The parsed workbook object.
   */
  private readExcelBufferToWorkbook(excelBuffer: Buffer): XLSX.WorkBook {
    const workbook = XLSX.read(excelBuffer, { type: "buffer" });
    console.log("Excel file read into workbook.");
    return workbook;
  }

  /**
   * Appends the concatenated tech metadata to a new worksheet in the workbook.
   * @param workbook - The Excel workbook to which the data will be appended.
   * @param concatenatedTechMetadata - The JSON data to append as a new worksheet.
   */
  private appendTechMetadataToWorkbook(
    workbook: XLSX.WorkBook,
    concatenatedTechMetadata: any[]
  ): void {
    const newWorksheetData = [
      Object.keys(concatenatedTechMetadata[0]), // Column headers
      ...concatenatedTechMetadata.map((item) => Object.values(item)), // Rows of data
    ];
    const newWorksheet = XLSX.utils.json_to_sheet(newWorksheetData);
    XLSX.utils.book_append_sheet(
      workbook,
      newWorksheet,
      "Technical Metadata v2"
    );
    console.log("New worksheet appended to workbook.");
  }
  // Helper function to update the 'Folder Send' column in the 'DIGITAL FILE LIST' worksheet
  private async updateDigitalFileListSheet(
    workbook: XLSX.WorkBook,
    accessionNumber: string,
    applicationNumber: string
  ) {
    const sheetName = "DIGITAL FILE LIST";
    const digitalFileListSheet = workbook.Sheets[sheetName];

    if (!digitalFileListSheet) {
      throw new Error(`Sheet '${sheetName}' not found.`);
    }

    const range = XLSX.utils.decode_range(
      digitalFileListSheet["!ref"] as string
    );
    this.insertFolderSendColumn(digitalFileListSheet, range);

    const transfer = await this.getTransfer(accessionNumber, applicationNumber);
    this.updateFolderSendValues(
      digitalFileListSheet,
      range,
      transfer.digitalFileLists as unknown as IDigitalFileList[]
    );
  }

  // Helper function to insert the 'Folder Send' column into the 'DIGITAL FILE LIST' sheet
  private insertFolderSendColumn(sheet: XLSX.WorkSheet, range: XLSX.Range) {
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.e.c; C >= 0; --C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const targetCellAddress = XLSX.utils.encode_cell({ r: R, c: C + 1 });
        if (C === 0) {
          sheet[targetCellAddress] = {
            t: "s",
            v: R === 0 ? "Folder Send" : "",
          };
        } else {
          sheet[targetCellAddress] = sheet[cellAddress];
        }
      }
    }
    range.e.c++;
    sheet["!ref"] = XLSX.utils.encode_range(range);
  }

  // Helper function to update the 'Folder Send' values based on the digital file lists
  private updateFolderSendValues(
    sheet: XLSX.WorkSheet,
    range: XLSX.Range,
    digitalFileLists: IDigitalFileList[]
  ) {
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 }); // Column A
      const folderValue = sheet[cellAddress]?.v;

      const matchingDigitalFileList = digitalFileLists.find(
        (dfl) => dfl.folder === folderValue
      );
      if (matchingDigitalFileList) {
        const targetCellAddress = XLSX.utils.encode_cell({ r: R, c: 1 }); // Column B
        sheet[targetCellAddress] = {
          t: "s",
          v: matchingDigitalFileList.folderSend || "",
        };
      }
    }
  }

  /**
   * Inserts a new column named 'Folder Send' after the first column in the given sheet.
   * @param sheet - The Excel worksheet where the new column will be inserted.
   */
  private insertNewColumn(sheet: XLSX.WorkSheet): void {
    const range = XLSX.utils.decode_range(sheet["!ref"] as string);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.e.c; C >= 0; --C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const targetCellAddress = XLSX.utils.encode_cell({ r: R, c: C + 1 });
        if (C === 0) {
          sheet[targetCellAddress] = {
            t: "s",
            v: R === 0 ? "Folder Send" : "",
          };
        } else {
          sheet[targetCellAddress] = sheet[cellAddress];
        }
      }
    }
    range.e.c++;
    sheet["!ref"] = XLSX.utils.encode_range(range);
    console.log("New column inserted into DIGITAL FILE LIST.");
  }

  /**
   * Converts the modified workbook into a buffer.
   * This buffer can be used for further processing, such as uploading to S3.
   * @param workbook - The XLSX workbook object to be converted.
   * @returns A buffer representing the Excel file.
   */
  private convertWorkbookToBuffer(workbook: XLSX.WorkBook): Buffer {
    return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  }

  /**
   * Uploads the updated Excel file buffer to S3.
   * The file is uploaded to a specific path within the S3 bucket.
   * @param buffer - The buffer representing the updated Excel file.
   * @param transferFolderPath - The base path in S3 where the file will be uploaded.
   * @param accessionNumber - The accession number used in the S3 key.
   * @param applicationNumber - The application number used in the S3 key.
   * @returns A promise that resolves when the upload is complete.
   */
  private async uploadUpdatedExcelToS3(
    buffer: Buffer,
    transferFolderPath: string,
    accessionNumber: string,
    applicationNumber: string
  ): Promise<void> {
    const newS3Key = `${transferFolderPath}${accessionNumber}-${applicationNumber}/Documentation/Update_Aris662-${accessionNumber}_${applicationNumber}.xlsx`;
    await this.s3ClientService.uploadUpdatedArris662ToS3(buffer, newS3Key);
  }
}
