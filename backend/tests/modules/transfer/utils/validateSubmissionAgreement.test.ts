import { validateSubmissionAgreement } from "@/modules/transfer/utils/validateSubmissionAgreement";
import { HttpError } from "@bcgov/citz-imb-express-utilities";
import { getDocument } from "pdfjs-dist";

// Mock dependencies
jest.mock("pdfjs-dist", () => ({
	getDocument: jest.fn(),
}));

describe("validateSubmissionAgreement", () => {
	const mockBuffer = Buffer.from("mock data");
	const accession = "123";
	const application = "456";

	const createMockPDF = (numPages: number, textContents: string[]) => ({
		promise: Promise.resolve({
			numPages,
			getPage: jest.fn().mockImplementation((pageNum) => ({
				getTextContent: jest.fn().mockResolvedValue({
					items: textContents[pageNum - 1].split(" ").map((str) => ({ str })),
				}),
			})),
		}),
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should validate the PDF successfully", async () => {
		// Test case: Valid PDF with correct text
		const mockPDF = createMockPDF(1, [`Accession # ${accession} and Application # ${application}`]);
		(getDocument as jest.Mock).mockReturnValue(mockPDF);

		await expect(
			validateSubmissionAgreement({ buffer: mockBuffer, accession, application }),
		).resolves.not.toThrow();
	});

	it("should throw an error if accession and application numbers are incorrect", async () => {
		// Test case: PDF missing expected text
		const mockPDF = createMockPDF(1, ["Some unrelated text"]);
		(getDocument as jest.Mock).mockReturnValue(mockPDF);

		await expect(
			validateSubmissionAgreement({ buffer: mockBuffer, accession, application }),
		).rejects.toEqual(
			new HttpError(
				400,
				"An error occurred while validating the PDF: Incorrect or missing accession and application numbers.",
			),
		);
	});

	it("should throw an error for invalid PDF structure", async () => {
		// Test case: Invalid PDF structure
		(getDocument as jest.Mock).mockImplementation(() => ({
			promise: Promise.reject(new Error("Invalid PDF structure")),
		}));

		await expect(
			validateSubmissionAgreement({ buffer: mockBuffer, accession, application }),
		).rejects.toEqual(new HttpError(400, "Invalid file: The provided buffer is not a valid PDF."));
	});

	it("should handle unexpected errors gracefully", async () => {
		// Test case: Unexpected error
		(getDocument as jest.Mock).mockImplementation(() => ({
			promise: Promise.reject(new Error("Unexpected error")),
		}));

		await expect(
			validateSubmissionAgreement({ buffer: mockBuffer, accession, application }),
		).rejects.toEqual(
			new HttpError(500, "An error occurred while validating the PDF: Unexpected error"),
		);
	});

	it("should throw a generic error for non-Error objects", async () => {
		// Test case: Non-error object thrown
		(getDocument as jest.Mock).mockImplementation(() => ({
			promise: Promise.reject("Non-error object"),
		}));

		await expect(
			validateSubmissionAgreement({ buffer: mockBuffer, accession, application }),
		).rejects.toEqual(new HttpError(500, "An unknown error occurred while validating the PDF."));
	});
});
