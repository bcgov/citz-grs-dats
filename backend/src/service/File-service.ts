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

const createAgreementPDF = async (
    agreementText: any[],
    status: string,
    decision: string,
    placeholders: { [key: string]: string }
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers);

            const accession_num = placeholders["AccessionNumber"];
            const application_num = placeholders["ApplicationNumber"];

            const transferFolderPath = process.env.TRANSFER_FOLDER_NAME || 'Transfers';
            const targetPdfPath = `${transferFolderPath}/${accession_num}-${application_num}/Documentation/agreement_${Date.now()}.pdf`;
            console.log("in createAgreementPDF" + targetPdfPath)
            try {
                let s3ClientService = new S3ClientService();
                await s3ClientService.uploadAgreementPDF(pdfBuffer, targetPdfPath);
                resolve(targetPdfPath);
            } catch (error) {
                reject(error);
            }
        });

        // Add your logo
        // doc.image('backend/src/utils/BClogo/BCID_H_rgb_rev.e68ccb04.png', {
        //     fit: [250, 250],
        //     align: 'center',
        //     valign: 'top'
        // }).moveDown();

        // Add agreement text sections
        agreementText.forEach(section => {
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
};
export default createAgreementPDF;
