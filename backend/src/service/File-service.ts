import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import S3ClientService from "../service/s3Client-service";
import createFolder from "../utils/createFolder";

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
    private lanDrivePath: string;

    constructor() {
        this.s3ClientService = new S3ClientService();
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

}



