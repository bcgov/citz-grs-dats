import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import SMB2 from 'smb2';
import S3ClientService from "../service/s3Client-service";
import TransferService from "../service/transfer-service";
import TransferRepository from "../repository/transfer-repository"
import validateBufferChecksum from "../utils/validateBufferChecksum"
import { IPsp } from 'src/models/psp-model';
import { TransferStatus } from "../models/enums/TransferStatus"
import logger from '../config/logs/winston-config';

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

    async createPSPs(transferId: string): Promise<string> {
        try {
            const transfer = await this.transferRepository.getTransferWithPsps(transferId);

            if (!transfer) {
                throw new Error('Transfer not found');
            }

            const psps = (transfer.psps as unknown as IPsp[]) ?? [];

            await Promise.all(psps.map(async (psp) => {
                if (psp.pathToS3) {
                    const zipBuffer = await this.s3ClientService.copyPSPFolderFromS3ToZip(psp.pathToS3);
                    if (zipBuffer) {
                        const shareLanDrive = process.env.SMB_ARCHIVE_LAND_DRIVE || 'C:\\TestDATS\\';
                        const directoryName = 'Tr_' + transfer.accessionNumber + "_" + transfer.applicationNumber;
                        const directoryPath = path.join(shareLanDrive, directoryName);

                        if (!fs.existsSync(directoryPath)) {
                            fs.mkdirSync(directoryPath, { recursive: true });
                        }

                        const filePath = path.join(directoryPath, `${psp.name}.zip`);

                        await fs.promises.writeFile(filePath, zipBuffer);

                        console.log('File saved successfully!');
                    } else {
                        console.log('No zip buffer created');
                    }
                }
            }));

            // Mark the Transfer PSP created
            transfer.transferStatus = TransferStatus.PSPcomplete;
            await this.transferRepository.updateTransfer(transferId, transfer);

            console.log('PSP folders moved successfully');
            return 'PSP folders created successfully';
        } catch (error) {
            console.error('Error moving PSP folders:', error);
            throw error;
        }
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


    private createFolder(localFolderPath: string): void {
        if (!fs.existsSync(localFolderPath)) {
            fs.mkdirSync(localFolderPath, { recursive: true });
        }
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




