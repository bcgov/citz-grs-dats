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


const createAgreementPDF = async (agreementText: any[], status: string, decision: string, placeholders: { [key: string]: string }): Promise<string> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const pdfFileName = `agreement_${Date.now()}.pdf`;
        console.log("pdfFileName=" + pdfFileName);

        var folderPath = process.env.UPLOAD_AGREEMENTS_FOLDER || "Agreements/";
        createFolder(folderPath);
        const pdfPath = path.join(folderPath, pdfFileName);

        // Ensure the directory exists
        //fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

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

        writeStream.on('finish', () => resolve(pdfPath));
        writeStream.on('error', (error) => reject(error));

        const accession_num = placeholders["AccessionNumber"];
        const application_num = placeholders["ApplicationNumber"];

        var transferFolderPath = process.env.TRANSFER_FOLDER_NAME || 'Transfers';
        const subApplicationPath = transferFolderPath + "/" + accession_num + "-" + application_num + "/";
        const subDocPath = subApplicationPath + "Documentation/";
        const targetPdfPath = subDocPath + pdfFileName;

        let s3ClientService = new S3ClientService();
        s3ClientService.uploadAgreementPDF(pdfPath, targetPdfPath);


    });
};

export default createAgreementPDF;
