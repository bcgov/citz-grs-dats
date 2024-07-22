import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import S3ClientService from "../service/s3Client-service";
import TransferService from "../service/transfer-service";
import validateFileChecksum from "../utils/validateFileChecksum"

import crypto from 'crypto';
import createFolder from "../utils/createFolder";
import { Request, ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { IPsp } from 'src/models/psp-model';

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
    private lanDrivePath: string;

    constructor() {
        this.s3ClientService = new S3ClientService();
        this.transferService = new TransferService();
        this.lanDrivePath = "Upload617/";
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
                    await this.s3ClientService.uploadAgreementPDF(pdfBuffer, targetPdfPath);
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

    //async createPSPs(prefix: string): Promise<void> {
    async createPSPs(prefix: string): Promise<void> {
        try {
            const objects = await this.s3ClientService.listObjects(prefix);
            const pspFolders = objects.filter((key) => key.includes('PSP-'));

            for (const key of pspFolders) {
                const folderPath = path.dirname(key);
                const fileName = path.basename(key);
                const localFolderPath = path.join(this.lanDrivePath, folderPath);

                // Create the destination folder
                this.createFolder(localFolderPath);

                // Download the file
                const downloadPath = path.join(localFolderPath, fileName);
                await this.s3ClientService.downloadFile(key, downloadPath);

                // Optionally, delete the file from S3
                //await this.s3ClientService.deleteObject(key);

                // Copy Documentation and Metadata folders to the PSP folder
                const documentationSourcePrefix = `${prefix}Documentation/`;
                const metadataSourcePrefix = `${prefix}Metadatas/`;

                // Calculate the new path within the PSP folder
                const pspLocalFolderPath = path.join(localFolderPath, 'Documentation');
                this.createFolder(pspLocalFolderPath);
                await this.copyFolder(documentationSourcePrefix, pspLocalFolderPath);

                const metadataLocalFolderPath = path.join(localFolderPath, 'Metadatas');
                this.createFolder(metadataLocalFolderPath);
                await this.copyFolder(metadataSourcePrefix, metadataLocalFolderPath);
            }

            console.log('PSP folders moved successfully');
        } catch (error) {
            console.error('Error moving PSP folders:', error);
            throw error;
        }
    }

    private createFolder(localFolderPath: string): void {
        if (!fs.existsSync(localFolderPath)) {
            fs.mkdirSync(localFolderPath, { recursive: true });
        }
    }
    private async copyFolder(sourcePrefix: string, destinationPath: string): Promise<void> {
        const objects = await this.s3ClientService.listObjects(sourcePrefix);

        for (const key of objects) {
            if (key.endsWith('/')) {
                // Skip directories
                continue;
            }

            const fileName = key.replace(sourcePrefix, '');
            const downloadPath = path.join(destinationPath, fileName);

            // Create the destination folder
            const folderPath = path.dirname(downloadPath);
            this.createFolder(folderPath);

            // Download the file
            await this.s3ClientService.downloadFile(key, downloadPath);
        }
    }
    async saveFolderDetails(file, receivedChecksum, transferId, applicationNumber, accessionNumber, primarySecondary, techMetadatav2) {

        if (!file || !receivedChecksum || !applicationNumber || !accessionNumber || !primarySecondary) {
            throw new Error('File, checksum, transferId, applicationNumber, accessionNumber or  classification missing');
        }

        console.log(" In File saveFolderDetails  = ");

        const isValid = await validateFileChecksum(file, receivedChecksum, 'sha1');
        if (!isValid) {
            console.log('Checksum mismatch. File validation failed.');
            throw new Error('Checksum mismatch. File validation failed.')
        }
        console.log("saveFolderDetails  = " + receivedChecksum);


        const s3ClientService = new S3ClientService();
        var transferFolderPath = process.env.TRANSFER_FOLDER_NAME || 'Transfers';

        // Create the PSP structure per classification     ex. PSP-94-1434-749399-11000-20

        const pspname = 'PSP-' + accessionNumber + "-" + applicationNumber + "-" + primarySecondary + "-01"
        const psppath = transferFolderPath + "/" + accessionNumber + "-" + applicationNumber + "/" + pspname + "/";
        s3ClientService.createFolder(psppath);


        // store the zip and checksum
        const zipFilePath = s3ClientService.uploadZipFile(file, receivedChecksum, psppath);

        const techMetadatav2test = [
            {
                "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\1-MB-DOC.doc",
                "FileName": "1-MB-DOC.doc",
                "Checksum": "88dc8b79636f7d5131d2446c6855ca956a176932",
                "DateCreated": "2024-06-27T16:32:40.7403152-04:00",
                "DateModified": "2024-06-27T16:32:43.6795841-04:00",
                "DateAccessed": "2024-07-15T19:09:13.1135847-04:00",
                "DateLastSaved": "2024-06-27T16:32:43.6795841-04:00",
                "AssociatedProgramName": "Pick an application",
                "Owner": "IDIR\\NSYED",
                "Computer": "VIRTUAL-MIND",
                "ContentType": "application/octet-stream",
                "SizeInBytes": 1048576
            },
            {
                "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\138-KB-XML-File.xml",
                "FileName": "138-KB-XML-File.xml",
                "Checksum": "abd4a088b49d9f9863be4f7fda45a0528f6a4af8",
                "DateCreated": "2024-06-27T16:39:14.7746566-04:00",
                "DateModified": "2024-06-27T16:39:19.0695192-04:00",
                "DateAccessed": "2024-07-15T19:09:13.1193231-04:00",
                "DateLastSaved": "2024-06-27T16:39:19.0695192-04:00",
                "AssociatedProgramName": "Microsoft Edge",
                "Owner": "IDIR\\NSYED",
                "Computer": "VIRTUAL-MIND",
                "ContentType": "application/octet-stream",
                "SizeInBytes": 141317
            }
        ]


        // Upload the technical metadata v2
        const jsonFileResponsedata = await s3ClientService.uploadTechnicalV2File(techMetadatav2test, psppath);

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




