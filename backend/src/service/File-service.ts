import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

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
        const pdfPath = path.join("C:\Doc", '..', 'agreements', `agreement_${Date.now()}.pdf`);

        // Ensure the directory exists
        fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

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
    });
};

export default createAgreementPDF;
