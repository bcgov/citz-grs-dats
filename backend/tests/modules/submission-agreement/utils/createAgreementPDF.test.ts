import path from "node:path";
import PDFDocument from "pdfkit";
import { createAgreementPDF } from "@/modules/submission-agreement/utils";

// Mock PDFKit
jest.mock("pdfkit", () => {
	const PDFKitMock = jest.fn();
	PDFKitMock.prototype = {
		registerFont: jest.fn(),
		on: jest.fn(),
		text: jest.fn().mockReturnThis(),
		moveDown: jest.fn().mockReturnThis(),
		font: jest.fn().mockReturnThis(),
		fontSize: jest.fn().mockReturnThis(),
		fillColor: jest.fn().mockReturnThis(),
		link: jest.fn().mockReturnThis(),
		stroke: jest.fn().mockReturnThis(),
		moveTo: jest.fn().mockReturnThis(),
		lineTo: jest.fn().mockReturnThis(),
		end: jest.fn(),
		page: { width: 612 }, // Letter size width in points
	};
	return PDFKitMock;
});

// Mock path resolution
jest.mock("node:path", () => {
	const realPath = jest.requireActual("node:path");
	return {
		...realPath,
		resolve: jest.fn((...args: string[]) =>
			realPath.resolve(process.cwd(), "src/modules/submission-agreement", ...args),
		),
	};
});

describe("createAgreementPDF", () => {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let pdfMock: any;

	beforeEach(() => {
		pdfMock = PDFDocument.prototype;

		// Mock the `on` method to simulate PDF generation
		pdfMock.on.mockImplementation((event: string, callback: (chunk?: Buffer) => void) => {
			if (event === "data") {
				callback(Buffer.from("Mock PDF chunk"));
			} else if (event === "end") {
				callback();
			} else if (event === "error") {
				// Do nothing for error in this mock
			}
		});
	});

	it("should generate a valid PDF buffer", async () => {
		const ministrySignature = "Test Signature";
		const ministryDate = "2024-01-01";
		const accession = 12345;
		const application = 67890;

		const pdfBuffer = await createAgreementPDF({
			ministrySignature,
			ministryDate,
			accession,
			application,
		});

		expect(pdfBuffer).toBeInstanceOf(Buffer);
		expect(pdfBuffer.length).toBeGreaterThan(0);
	});

	it("should register fonts correctly", async () => {
		const ministrySignature = "Test Signature";
		const ministryDate = "2024-01-01";
		const accession = 12345;
		const application = 67890;

		await createAgreementPDF({
			ministrySignature,
			ministryDate,
			accession,
			application,
		});

		expect(pdfMock.registerFont).toHaveBeenCalledWith(
			"BCSans-Regular",
			path.resolve(process.cwd(), "src/modules/submission-agreement/assets/BCSans-Regular.ttf"),
		);
		expect(pdfMock.registerFont).toHaveBeenCalledWith(
			"BCSans-Bold",
			path.resolve(process.cwd(), "src/modules/submission-agreement/assets/BCSans-Bold.ttf"),
		);
		expect(pdfMock.registerFont).toHaveBeenCalledWith(
			"Autography",
			path.resolve(process.cwd(), "src/modules/submission-agreement/assets/Autography.otf"),
		);
	});

	it("should include specific text in the PDF", async () => {
		const ministrySignature = "Test Signature";
		const ministryDate = "2024-01-01";
		const accession = 12345;
		const application = 67890;

		await createAgreementPDF({
			ministrySignature,
			ministryDate,
			accession,
			application,
		});

		expect(pdfMock.text).toHaveBeenCalledWith(
			"BC GOVERNMENT DIGITAL ARCHIVES\nSUBMISSION AGREEMENT",
			{ align: "center" },
		);

		expect(pdfMock.text).toHaveBeenCalledWith(expect.stringContaining(`Accession # ${accession}`), {
			align: "left",
		});

		expect(pdfMock.text).toHaveBeenCalledWith(
			expect.stringContaining(`Application # ${application}`),
			{
				align: "left",
			},
		);
	});

	it("should draw signature lines and labels correctly", async () => {
		const ministrySignature = "Test Signature";
		const ministryDate = "2024-01-01";
		const accession = 12345;
		const application = 67890;

		await createAgreementPDF({
			ministrySignature,
			ministryDate,
			accession,
			application,
		});

		// Verify the correct number of calls
		expect(pdfMock.moveTo).toHaveBeenCalledTimes(8);
		expect(pdfMock.lineTo).toHaveBeenCalledTimes(8);

		// Verify labels
		expect(pdfMock.text).toHaveBeenCalledWith(
			"Ministry Representative",
			expect.any(Number),
			expect.any(Number),
		);
		expect(pdfMock.text).toHaveBeenCalledWith("Date", expect.any(Number), expect.any(Number));
	});
});
