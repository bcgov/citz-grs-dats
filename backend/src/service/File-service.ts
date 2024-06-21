
import bodyParser from "body-parser";
import pdfkit from "pdfkit";
import path from "path";
import fs from "fs";


const createAgreementPDF = async (agreementText, status, decision) => {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit();
        const pdfPath = path.join(__dirname, 'agreements', `agreement_${Date.now()}.pdf`);

        // Ensure the directory exists
        fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        doc.fontSize(12).text(agreementText, { align: 'left' });
        doc.moveDown();
        doc.fontSize(12).text(`Status: ${status}`, { align: 'left' });
        doc.moveDown();
        doc.fontSize(12).text(`Decision: ${decision}`, { align: 'left' });

        doc.end();

        writeStream.on('finish', () => resolve(pdfPath));
        writeStream.on('error', (error) => reject(error));
    });
};
export default createAgreementPDF
