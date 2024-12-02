import PDFDocument from "pdfkit";
import path from "node:path";

type Props = {
	ministrySignature: string;
	ministryDate: string;
	accession: number | string;
	application: number | string;
};

export const createAgreementPDF = async ({
	ministrySignature,
	ministryDate,
	accession,
	application,
}: Props): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		try {
			// Create a new PDF document
			const doc = new PDFDocument({
				size: "LETTER", // 8.5 x 11 inches
				margins: { top: 50, bottom: 50, left: 50, right: 50 },
			});

			// Load BC Sans font files
			const bcSansRegular = path.resolve(__dirname, "../assets/BCSans-Regular.ttf");
			const bcSansBold = path.resolve(__dirname, "../assets/BCSans-Bold.ttf");
			const autographyFontPath = path.resolve(__dirname, "../assets/Autography.otf");

			// Register fonts
			doc.registerFont("BCSans-Regular", bcSansRegular);
			doc.registerFont("BCSans-Bold", bcSansBold);
			doc.registerFont("Autography", autographyFontPath);

			// Collect PDF data into a buffer
			const bufferChunks: Buffer[] = [];
			doc.on("data", (chunk) => bufferChunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(bufferChunks)));
			doc.on("error", (err) => {
				console.error("PDF generation error:", err);
				reject(err);
			});

			// Header
			doc
				.font("BCSans-Bold")
				.fontSize(12)
				.text("BC GOVERNMENT DIGITAL ARCHIVES\nDRAFT SUBMISSION AGREEMENT", {
					align: "center",
				})
				.moveDown(1);

			// Agreement Introduction
			const agreementIntro = `
This is an agreement between BC's Digital Archives and the Ministry, for the Transfer of government records under Accession # ${accession} and Application # ${application}.

The purpose of this agreement is to transfer Full Retention (FR) government records, after the date of their Final Disposition (FD), from the legal and physical custody of the Ministry to the Digital Archives.

The Ministry and Digital Archives agree that:
`;

			doc.font("BCSans-Regular").fontSize(11).text(agreementIntro, {
				align: "left",
			});

			// Agreement Details
			const agreementDetails = `
1.  The Ministry currently holds legal and physical custody of the government records being transferred, and declares that the records are authentic evidence of government actions and decisions.

2.  The government records are subject to the Information Management Act (IMA), Freedom of Information and Protection of Privacy Act (FIPPA), and other relevant legislation.

3.  The government records meet all conditions outlined in the `;

			doc.fontSize(10).text(agreementDetails, {
				align: "left",
				lineGap: 1.5,
				continued: true,
			});

			// Add hyperlinks
			doc
				.fillColor("blue")
				.text("Managing Government Information Policy (MGIP)", {
					link: "https://www2.gov.bc.ca/gov/content/governments/services-for-government/policies-procedures/government-records",
					underline: true,
					continued: true,
				})
				.fillColor("black")
				.text(" and ", {
					underline: false,
					continued: true,
				})
				.fillColor("blue")
				.text("RIM Manual Section 3.3 Transfer to Archives.", {
					link: "https://www2.gov.bc.ca/gov/content/governments/services-for-government/policies-procedures/government-records/rim-manual/rim-manual-3-3",
					underline: true,
				});

			const agreementDetailsContinued = `
4.  None of the government records being transferred will be destroyed by the Ministry until the Digital Archives verifies the creation of Archival Information Packages (AIPs) in the preservation system, which completes the transfer process. After verification, the source information will be a redundant copy and will be destroyed appropriately by the Ministry, to reduce duplication and ensure a single source of truth.

5.  Upon completion of the transfer process, the Digital Archives will assume legal and physical custody and be responsible for the ongoing management of the archived government records on behalf of the Province.

6.  The Digital Archives will protect personal information and provide access to the government records in accordance with the Information Management Act (IMA), the Freedom of Information and Protection of Privacy Act, and other relevant legislation.
`;

			doc.fontSize(10).fillColor("black").text(agreementDetailsContinued, {
				align: "left",
				lineGap: 1.5,
			});

			// Add signatures section
			doc.moveDown(3);

			const pageWidth = doc.page.width; // Width of the page
			const margin = 50; // Left and right margin
			const signatureWidth = 200; // Width of the signature line
			const labelYOffset = 5; // Offset for labels under the lines
			const signatureYOffset = -20; // Offset for signature text above the line
			const dateYOffset = -32; // Offset for date text above the line

			const ministryRepX = margin;
			const dateX = pageWidth - margin - signatureWidth;

			// Draw lines for "Ministry Representative" and "Date"
			doc
				.moveTo(ministryRepX, doc.y)
				.lineTo(ministryRepX + signatureWidth, doc.y)
				.stroke();

			doc
				.moveTo(dateX, doc.y)
				.lineTo(dateX + signatureWidth, doc.y)
				.stroke();

			// Add signature and date text above the lines
			doc
				.font("Autography") // Signature-like font
				.fontSize(18)
				.text(ministrySignature, ministryRepX, doc.y + signatureYOffset, {
					width: signatureWidth,
					align: "center",
				});

			doc
				.font("BCSans-Regular") // Date in regular font
				.fontSize(12)
				.text(ministryDate, dateX, doc.y + dateYOffset, {
					width: signatureWidth,
					align: "center",
				});

			// Add labels directly under the lines
			const lineBottomY = doc.y + labelYOffset;
			doc
				.font("BCSans-Regular")
				.fontSize(12)
				.text("Ministry Representative", ministryRepX, lineBottomY)
				.text("Date", dateX, lineBottomY);

			// Move down for the next section
			doc.moveDown(2);

			// Draw lines for "Digital Archives Representative" and "Date"
			doc
				.moveTo(ministryRepX, doc.y)
				.lineTo(ministryRepX + signatureWidth, doc.y)
				.stroke();

			doc
				.moveTo(dateX, doc.y)
				.lineTo(dateX + signatureWidth, doc.y)
				.stroke();

			// Add labels directly under the lines
			const lineBottomY2 = doc.y + labelYOffset;
			doc
				.text("Digital Archives Representative", ministryRepX, lineBottomY2)
				.text("Date", dateX, lineBottomY2);

			// Finalize the document
			doc.end();
		} catch (err) {
			reject(err);
		}
	});
};
