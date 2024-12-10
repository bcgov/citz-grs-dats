import { Buffer } from "node:buffer";
import xlsx from "xlsx";
import { validateDigitalFileList } from "@/modules/transfer/utils/validateDigitalFileList";

jest.mock("xlsx", () => ({
	read: jest.fn(),
}));

describe("validateDigitalFileList", () => {
	// Test case: Should validate a valid .xlsx file with correct data
	it("should validate a valid .xlsx file with correct data", async () => {
		const mockBuffer = Buffer.from("504b0304", "hex");
		const mockWorkbook = {
			Sheets: {
				"COVER PAGE": {
					B2: { v: "2024-12-01" },
					B3: { v: "ACCESSION123" },
					B4: { v: "APPLICATION123" },
				},
			},
		};
		(xlsx.read as jest.Mock).mockReturnValue(mockWorkbook);

		await expect(
			validateDigitalFileList({
				buffer: mockBuffer,
				accession: "ACCESSION123",
				application: "APPLICATION123",
			}),
		).resolves.toBeUndefined();
	});

	// Test case: Should throw an error if .xlsx file is missing "COVER PAGE" sheet
	it('should throw an error if .xlsx file is missing "COVER PAGE" sheet', async () => {
		const mockBuffer = Buffer.from("504b0304", "hex");
		const mockWorkbook = { Sheets: {} };
		(xlsx.read as jest.Mock).mockReturnValue(mockWorkbook);

		await expect(
			validateDigitalFileList({
				buffer: mockBuffer,
				accession: "ACCESSION123",
				application: "APPLICATION123",
			}),
		).rejects.toThrow('The Digital File List must contain a "COVER PAGE" sheet.');
	});

	// Test case: Should throw an error if required XLSX fields are missing
	it("should throw an error if required XLSX fields are missing", async () => {
		const mockBuffer = Buffer.from("504b0304", "hex");
		const mockWorkbook = {
			Sheets: {
				"COVER PAGE": {
					B2: { v: "" }, // Missing last revised date
					B3: { v: "ACCESSION123" },
					B4: { v: "APPLICATION123" },
				},
			},
		};
		(xlsx.read as jest.Mock).mockReturnValue(mockWorkbook);

		await expect(
			validateDigitalFileList({
				buffer: mockBuffer,
				accession: "ACCESSION123",
				application: "APPLICATION123",
			}),
		).rejects.toThrow("The Digital File List is missing the Last Revised Date.");
	});

	// Test case: Should validate a valid JSON file with correct data
	it("should validate a valid JSON file with correct data", async () => {
		const mockBuffer = Buffer.from(
			JSON.stringify({
				admin: {
					lastRevised: "2024-12-01",
					accession: "ACCESSION123",
					application: "APPLICATION123",
				},
			}),
			"utf-8",
		);

		await expect(
			validateDigitalFileList({
				buffer: mockBuffer,
				accession: "ACCESSION123",
				application: "APPLICATION123",
			}),
		).resolves.toBeUndefined();
	});

	// Test case: Should throw an error if JSON is missing required fields
	it("should throw an error if JSON is missing required fields", async () => {
		const mockBuffer = Buffer.from(
			JSON.stringify({
				admin: { accession: "ACCESSION123", application: "APPLICATION123" }, // Missing last revised
			}),
			"utf-8",
		);

		await expect(
			validateDigitalFileList({
				buffer: mockBuffer,
				accession: "ACCESSION123",
				application: "APPLICATION123",
			}),
		).rejects.toThrow(
			'The Digital File List is missing "admin.accession", "admin.application" numbers, or "admin.lastRevised".',
		);
	});

	// Test case: Should throw an error if accession or application numbers in JSON are incorrect
	it("should throw an error if accession or application numbers in JSON are incorrect", async () => {
		const mockBuffer = Buffer.from(
			JSON.stringify({
				admin: {
					lastRevised: "2024-12-01",
					accession: "WRONG_ACCESSION",
					application: "APPLICATION123",
				},
			}),
			"utf-8",
		);

		await expect(
			validateDigitalFileList({
				buffer: mockBuffer,
				accession: "ACCESSION123",
				application: "APPLICATION123",
			}),
		).rejects.toThrow(
			'The Digital File List has incorrect "admin.accession" or "admin.application" numbers.',
		);
	});

	// Test case: Should throw an error for invalid file type
	it("should throw an error for invalid file type", async () => {
		const mockBuffer = Buffer.from("INVALIDFILE");

		await expect(
			validateDigitalFileList({
				buffer: mockBuffer,
				accession: "ACCESSION123",
				application: "APPLICATION123",
			}),
		).rejects.toThrow("The Digital File List must be a .xlsx or .json file.");
	});
});
