import { Buffer } from "node:buffer";
import yauzl from "yauzl";
import { validateStandardTransferStructure } from "@/modules/transfer/utils/validateStandardTransferStructure";
import { HttpError, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";

jest.mock("yauzl");

// Test suite for validateStandardTransferStructure
describe("validateStandardTransferStructure", () => {
	// Test case: Valid zip file with correct structure
	it("should resolve when the zip file has the correct structure", async () => {
		const buffer = Buffer.from("fake buffer");

		const mockEntries = [
			{ fileName: "content/sample.txt" },
			{ fileName: "documentation/Digital_File_List_.xlsx" },
			{ fileName: "documentation/Transfer_Form_.pdf" },
			{ fileName: "documentation/Submission_Agreement_.pdf" },
			{ fileName: "metadata/admin.json" },
			{ fileName: "metadata/files.json" },
			{ fileName: "metadata/folders.json" },
		];

		(yauzl.fromBuffer as jest.Mock).mockImplementation((_, __, callback) => {
			const mockZipFile = {
				readEntry: jest.fn(),
				on: jest.fn((event, listener) => {
					if (event === "entry") {
						mockEntries.forEach((entry) => listener(entry));
					} else if (event === "end") {
						listener();
					}
				}),
			};
			callback(null, mockZipFile);
		});

		await expect(validateStandardTransferStructure({ buffer })).resolves.toBeUndefined();
	});

	// Test case: Missing required directories
	it("should reject if the zip file is missing required directories", async () => {
		const buffer = Buffer.from("fake buffer");

		const mockEntries = [{ fileName: "documentation/Digital_File_List_.xlsx" }];

		(yauzl.fromBuffer as jest.Mock).mockImplementation((_, __, callback) => {
			const mockZipFile = {
				readEntry: jest.fn(),
				on: jest.fn((event, listener) => {
					if (event === "entry") {
						mockEntries.forEach((entry) => listener(entry));
					} else if (event === "end") {
						listener();
					}
				}),
			};
			callback(null, mockZipFile);
		});

		await expect(validateStandardTransferStructure({ buffer })).rejects.toThrow(
			new HttpError(
				HTTP_STATUS_CODES.BAD_REQUEST,
				"Zip file is missing required directories: content, metadata.",
			),
		);
	});

	// Test case: Missing required files
	it("should reject if the zip file is missing required files", async () => {
		const buffer = Buffer.from("fake buffer");

		const mockEntries = [
			{ fileName: "content/sample.txt" },
			{ fileName: "documentation/Transfer_Form_.pdf" },
			{ fileName: "metadata/admin.json" },
		];

		(yauzl.fromBuffer as jest.Mock).mockImplementation((_, __, callback) => {
			const mockZipFile = {
				readEntry: jest.fn(),
				on: jest.fn((event, listener) => {
					if (event === "entry") {
						mockEntries.forEach((entry) => listener(entry));
					} else if (event === "end") {
						listener();
					}
				}),
			};
			callback(null, mockZipFile);
		});

		await expect(validateStandardTransferStructure({ buffer })).rejects.toThrow(
			new HttpError(
				HTTP_STATUS_CODES.BAD_REQUEST,
				`The zip file is missing required files: Digital File List (beginning with 'Digital_File_List_' or 'File List') must be included and have a .xlsx or .json extension in the documentation directory. Submission Agreement (beginning with 'Submission_Agreement_') must be included and have a .pdf extension in the documentation directory. files.json must be included in the metadata directory. folders.json must be included in the metadata directory.`,
			),
		);
	});

	// Test case: Invalid zip file
	it("should reject if the buffer is not a valid zip file", async () => {
		const buffer = Buffer.from("invalid zip file");

		(yauzl.fromBuffer as jest.Mock).mockImplementation((_, __, callback) => {
			callback(new Error("Invalid zip file"), null);
		});

		await expect(validateStandardTransferStructure({ buffer })).rejects.toThrow(
			new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Provided buffer is not a valid zip file."),
		);
	});

	// Test case: Error during zip file processing
	it("should reject if an error occurs during zip file processing", async () => {
		const buffer = Buffer.from("fake buffer");

		(yauzl.fromBuffer as jest.Mock).mockImplementation((_, __, callback) => {
			const mockZipFile = {
				readEntry: jest.fn(),
				on: jest.fn((event, listener) => {
					if (event === "error") {
						listener(new Error("Unexpected error"));
					}
				}),
			};
			callback(null, mockZipFile);
		});

		await expect(validateStandardTransferStructure({ buffer })).rejects.toThrow(
			new HttpError(
				HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
				"Error reading zip file: Unexpected error",
			),
		);
	});
});
