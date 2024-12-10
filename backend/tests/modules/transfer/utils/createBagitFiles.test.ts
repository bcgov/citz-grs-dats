import { createBagitFiles } from "@/modules/transfer/utils/createBagitFiles";
import type { TransferZod } from "@/modules/transfer/entities";

// Mock files data for testing
const mockFiles: TransferZod["metadata"]["files"] = {
	group1: [
		{
			filepath: "documents/report1.pdf",
			filename: "report1.pdf",
			size: "1024",
			checksum: "abc123def456",
			birthtime: "2023-12-01T10:00:00Z",
			lastModified: "2023-12-02T12:00:00Z",
			lastAccessed: "2023-12-03T14:00:00Z",
			lastSaved: null,
			authors: "John Doe",
			owner: "Jane Smith",
			company: "Example Corp",
			computer: "COMP123",
			contentType: "application/pdf",
			programName: "PDF Editor",
		},
	],
	group2: [
		{
			filepath: "images/photo1.jpg",
			filename: "photo1.jpg",
			size: "2048",
			checksum: "789ghi012jkl",
			birthtime: "2023-11-01T08:00:00Z",
			lastModified: "2023-11-02T09:00:00Z",
			lastAccessed: "2023-11-03T10:00:00Z",
			lastSaved: "2023-11-03T10:00:00Z",
			authors: null,
			owner: "John Doe",
			company: "Example Corp",
			computer: "COMP456",
			contentType: "image/jpeg",
			programName: null,
		},
	],
};

describe("createBagitFiles", () => {
	// Test suite for createBagitFiles

	it("should generate a valid bagit.txt buffer", () => {
		const result = createBagitFiles(mockFiles);
		const expectedBagit = "BagIt-Version: 1.0\nTag-File-Character-Encoding: UTF-8\n";
		expect(result.bagit.toString()).toBe(expectedBagit);
	});

	it("should generate a valid manifest.txt buffer", () => {
		const result = createBagitFiles(mockFiles);
		const expectedManifest =
			"abc123def456 data/documents/report1.pdf\n" + "789ghi012jkl data/images/photo1.jpg\n";
		expect(result.manifest.toString()).toBe(expectedManifest);
	});
});
