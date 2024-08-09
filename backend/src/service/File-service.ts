import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import SMB2 from 'smb2';
import S3ClientService from "../service/s3Client-service";
import TransferService from "../service/transfer-service";
import TransferRepository from "../repository/transfer-repository"
import validateBufferChecksum from "../utils/validateBufferChecksum"
import calculateHash from "../utils/calculateHash"
import { IPsp } from 'src/models/psp-model';
import { TransferStatus } from "../models/enums/TransferStatus"
import logger from '../config/logs/winston-config';
import { ITransfer } from 'src/models/transfer-model';

const replacePlaceholders = (text: string, placeholders: { [key: string]: string }): string => {
    let replacedText = text;
    for (const [key, value] of Object.entries(placeholders)) {
        replacedText = replacedText.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
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
    private lanDrivePath: string;

    constructor() {
        this.s3ClientService = new S3ClientService();
        this.transferService = new TransferService();
        this.transferRepository = new TransferRepository();
        this.lanDrivePath = "Upload617/";
    }
    async createNote(notes: string, placeholders: Placeholder): Promise<string> {
        const accession_num = placeholders['AccessionNumber'];
        const application_num = placeholders['ApplicationNumber'];

        const transferFolderPath = process.env.TRANSFER_FOLDER_NAME || 'Transfers';
        const targetNotePath = `${transferFolderPath}/${accession_num}-${application_num}/Documentation/note_${Date.now()}.txt`;
        logger.debug(`uploaded note path ${targetNotePath}`);
        await this.s3ClientService.uploadDocumentationToS3(Buffer.from(notes), targetNotePath);
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

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', async () => {
                const pdfBuffer = Buffer.concat(buffers);

                const accession_num = placeholders['AccessionNumber'];
                const application_num = placeholders['ApplicationNumber'];

                const transferFolderPath = process.env.TRANSFER_FOLDER_NAME || 'Transfers';
                const targetPdfPath = `${transferFolderPath}/${accession_num}-${application_num}/Documentation/agreement_${Date.now()}.pdf`;
                console.log('in createAgreementPDF ' + targetPdfPath);

                try {
                    await this.s3ClientService.uploadDocumentationToS3(pdfBuffer, targetPdfPath);
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
                const replacedContent = replacePlaceholders(section.content, placeholders);
                doc.fontSize(section.isTitle ? 14 : 12)
                    .font(section.isTitle ? 'Helvetica-Bold' : 'Helvetica')
                    .text(replacedContent, { align: section.isTitle ? 'center' : 'left' })
                    .moveDown();
            });

            doc.fontSize(12).text(`Status: ${status}`, { align: 'left' });
            doc.moveDown();
            doc.fontSize(12).text(`Decision: ${decision}`, { align: 'left' });

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
            const transfer = await this.transferRepository.getTransferWithPsps(transferId);

            if (!transfer) {
                throw new Error('Transfer not found');
            }

            if (transfer.psps && Array.isArray(transfer.psps)) {
                const psps = transfer.psps as unknown as IPsp[];

                const transferFolderPath = this.getTransferFolderPath(transfer);

                await this.processPSPs(psps, transferFolderPath);
            } else {
                console.log('No PSPs found for this transfer.');
            }

            await this.markTransferAsComplete(transferId, transfer);

            console.log('PSP folders moved successfully');
            return 'PSP folders created successfully';
        } catch (error) {
            console.error('Error moving PSP folders:', error);
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
    private async processPSPs(psps: IPsp[], transferFolderPath: string): Promise<void> {
        if (!psps || psps.length === 0) return;

        await Promise.all(psps.map(async (psp) => {
            if (psp.pathToS3) {
                await this.handlePSP(psp, transferFolderPath);
            }
        }));
    }
    /**
         * Handles the process for a single PSP, including zipping, hashing, uploading, and saving the hash as a JSON file.
         * @param psp - The PSP object to process.
         * @param transferFolderPath - The base folder path where files will be uploaded in S3.
         */
    private async handlePSP(psp: IPsp, transferFolderPath: string): Promise<void> {
        if (!psp.pathToS3) {
            throw new Error(`PSP path is undefined for PSP: ${psp.name}`);
        }

        const zipBuffer = await this.s3ClientService.copyPSPFolderFromS3ToZip(psp.pathToS3);
        if (!zipBuffer) {
            console.log(`No zip buffer created for PSP: ${psp.name}`);
            return;
        }

        const filePath = `${psp.name}.zip`;
        const zipBufferHash = await this.calculateHashForBuffer(zipBuffer);

        await this.uploadPSP(zipBuffer, filePath, transferFolderPath);
        await this.savePSPHashToJson(filePath, zipBufferHash, transferFolderPath);

        console.log(`File ${filePath} saved successfully!`);
    }/**
     * Calculates the hash of the provided buffer using the specified algorithm.
     * @param buffer - The buffer (e.g., ZIP file) for which the hash is calculated.
     * @returns A promise that resolves to the hash as a string.
     */
    private async calculateHashForBuffer(buffer: Buffer): Promise<string> {
        return calculateHash(buffer, 'sha1') as unknown as string;
    }

    /**
     * Uploads the provided ZIP buffer to S3 at the specified file path.
     * @param zipBuffer - The buffer containing the ZIP file data.
     * @param filePath - The file path in S3 where the ZIP file will be uploaded.
     * @param transferFolderPath - The base folder path where files will be uploaded in S3.
     */
    private async uploadPSP(zipBuffer: Buffer, filePath: string, transferFolderPath: string): Promise<void> {
        await this.s3ClientService.uploadPSPToS3(zipBuffer, filePath, transferFolderPath);
    }

    /**
     * Saves the hash of the ZIP file as a JSON file in S3 with a .checksum.json extension.
     * @param filePath - The original file path of the ZIP file.
     * @param zipBufferHash - The calculated hash of the ZIP file.
     * @param transferFolderPath - The base folder path where files will be uploaded in S3.
     */
    private async savePSPHashToJson(filePath: string, zipBufferHash: string, transferFolderPath: string): Promise<void> {
        // const checksumFilePath = `${transferFolderPath}${filePath.replace('.zip', '.checksum.json')}`;
        await this.s3ClientService.savePspHashToJson(filePath, zipBufferHash, transferFolderPath);
    }

    /**
     * Updates the transfer's status to "PSPcomplete" and saves the changes to the repository.
     * @param transferId - The ID of the transfer to update.
     * @param transfer - The transfer object to be updated.
     */
    private async markTransferAsComplete(transferId: string, transfer: ITransfer): Promise<void> {
        transfer.transferStatus = TransferStatus.PSPcomplete;
        await this.transferRepository.updateTransfer(transferId, transfer);
    }


    private async sendBufferToSMBShare(buffer: Buffer, fileName: string) {
        const smb2Client = new SMB2({
            share: process.env.SMB_ARCHIVE_LAND_DRIVE || 'C:\\TestDATS\\',
            domain: process.env.SMB_ARCHIVE_LAND_DRIVE || "",
            username: process.env.SMB_ARCHIVE_LAND_DRIVE || "",
            password: process.env.SMB_ARCHIVE_LAND_DRIVE || "",
        });

        const remoteFilePath = `${fileName}`;

        return new Promise<void>((resolve, reject) => {
            smb2Client.writeFile(remoteFilePath, buffer, (err) => {
                if (err) {
                    return reject(err);
                }

                console.log("File successfully sent to SMB share.");
                resolve();
            });
        });
    }

    async saveFolderDetails(file, receivedChecksum, transferId, applicationNumber, accessionNumber, primarySecondary, techMetadatav2) {

        if (!file || !receivedChecksum || !applicationNumber || !accessionNumber || !primarySecondary) {
            throw new Error('File, checksum, transferId, applicationNumber, accessionNumber or  classification missing');
        }

        console.log(" In File saveFolderDetails  = ");

        const isValid = await validateBufferChecksum(file, receivedChecksum, 'sha1');
        if (!isValid) {
            console.log('Checksum mismatch. File validation failed.');
            throw new Error('Checksum mismatch. File validation failed.')
        }
        // get the admin json
        const transfer = await this.transferRepository.getTransferByKeysNumbers(accessionNumber, applicationNumber);
        console.log(' in the transfer' + transfer);
        if (!transfer) {
            throw new Error('Transfer not found');
        }

        const transferAdminJson = JSON.stringify(transfer);
        console.log("Admin Metadatas : " + transferAdminJson)

        const s3ClientService = new S3ClientService();
        var transferFolderPath = process.env.TRANSFER_FOLDER_NAME || 'Transfers';


        const pspname = 'PSP-' + accessionNumber + "-" + applicationNumber + "-" + primarySecondary + "-01"
        const psppath = transferFolderPath + "/" + accessionNumber + "-" + applicationNumber + "/" + pspname + "/";
        await s3ClientService.createFolder(psppath);


        // store the zip and checksum
        const zipFilePath = await s3ClientService.uploadZipFile(file, receivedChecksum, psppath);

        // const techMetadatav2test = [
        //     {
        //         "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\1-MB-DOC.doc",
        //         "FileName": "1-MB-DOC.doc",
        //         "Checksum": "88dc8b79636f7d5131d2446c6855ca956a176932",
        //         "DateCreated": "2024-06-27T16:32:40.7403152-04:00",
        //         "DateModified": "2024-06-27T16:32:43.6795841-04:00",
        //         "DateAccessed": "2024-07-15T19:09:13.1135847-04:00",
        //         "DateLastSaved": "2024-06-27T16:32:43.6795841-04:00",
        //         "AssociatedProgramName": "Pick an application",
        //         "Owner": "IDIR\\NSYED",
        //         "Computer": "VIRTUAL-MIND",
        //         "ContentType": "application/octet-stream",
        //         "SizeInBytes": 1048576
        //     },
        //     {
        //         "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\138-KB-XML-File.xml",
        //         "FileName": "138-KB-XML-File.xml",
        //         "Checksum": "abd4a088b49d9f9863be4f7fda45a0528f6a4af8",
        //         "DateCreated": "2024-06-27T16:39:14.7746566-04:00",
        //         "DateModified": "2024-06-27T16:39:19.0695192-04:00",
        //         "DateAccessed": "2024-07-15T19:09:13.1193231-04:00",
        //         "DateLastSaved": "2024-06-27T16:39:19.0695192-04:00",
        //         "AssociatedProgramName": "Microsoft Edge",
        //         "Owner": "IDIR\\NSYED",
        //         "Computer": "VIRTUAL-MIND",
        //         "ContentType": "application/octet-stream",
        //         "SizeInBytes": 141317
        //     }
        // ]


        // Upload the technical metadata v2
        const jsonFileResponsedata = await s3ClientService.uploadTechnicalV2File(techMetadatav2, zipFilePath);

        // Prepared the Psp
        const pspData: Partial<IPsp> = {
            name: pspname,
            pathToS3: psppath,
            pathToLan: " ",
            pspStatus: "To be Create"
        };

        // add the psp to the transfer

        this.transferService.addPspToTransfer(accessionNumber, applicationNumber, pspname, pspData)
            .then(updatedTransfer => {
                console.log("Updated Transfer:", updatedTransfer);
            })
            .catch(error => {
                throw new Error("Error adding PSP to Transfer:");
            });

    }

}




