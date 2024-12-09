import { Buffer } from "node:buffer";
import xlsx from "xlsx";
import { validateDigitalFileList } from "@/modules/transfer/utils/validateDigitalFileList";

jest.mock("xlsx", () => ({
	read: jest.fn(),
}));

describe("validateDigitalFileList", () => {
	// Test case: Should validate a valid .xlsx file with correct accession and application numbers
	it("should validate a valid .xlsx file with correct accession and application numbers", async () => {
		const mockBuffer = Buffer.from(
			"504b0304", // .xlsx file signature
			"hex",
		);
		const mockWorkbook = {
			Sheets: {
				"COVER PAGE": {
					B5: { v: "ACCESSION123" },
					B6: { v: "APPLICATION123" },
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

	// Test case: Should validate a valid JSON file with correct accession and application numbers
	it("should validate a valid JSON file with correct accession and application numbers", async () => {
		const mockBuffer = Buffer.from(
			JSON.stringify({
				admin: {
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

	// Test case: Should throw an error if JSON file is missing "admin.accession" or "admin.application"
	it('should throw an error if JSON file is missing "admin.accession" or "admin.application"', async () => {
		const mockBuffer = Buffer.from(JSON.stringify({ admin: {} }), "utf-8");

		await expect(
			validateDigitalFileList({
				buffer: mockBuffer,
				accession: "ACCESSION123",
				application: "APPLICATION123",
			}),
		).rejects.toThrow(
			'The Digital File List is missing "admin.accession" or "admin.application" numbers.',
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
