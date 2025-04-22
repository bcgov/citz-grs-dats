import { createBagitFiles } from "@/modules/transfer/utils/createBagitFiles";
import type { TransferZod } from "@/modules/transfer/entities";

// Mock files data for testing
const mockFiles: NonNullable<TransferZod["metadata"]>["files"] = {
  "C:/data/documents": [
    {
      filepath: "C:/data/documents/report1.pdf",
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
  "C:/data/images": [
    {
      filepath: "C:/data/images/photo1.jpg",
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
    const folders = ["C:/data/documents", "C:/data/images"];
    const result = createBagitFiles({ files: mockFiles, folders });
    const expectedBagit =
      "BagIt-Version: 1.0\nTag-File-Character-Encoding: UTF-8\n";
    expect(result.bagit.toString()).toBe(expectedBagit);
  });

  it("should generate a valid manifest.txt buffer for included folders", () => {
    const folders = ["C:/data/documents", "C:/data/images"];
    const result = createBagitFiles({ files: mockFiles, folders });
    const expectedManifest =
      "abc123def456 data/documents/report1.pdf\n" +
      "789ghi012jkl data/images/photo1.jpg\n";
    expect(result.manifest.toString()).toBe(expectedManifest);
  });

  it("should generate an empty manifest.txt buffer if no folders match", () => {
    const folders = ["C:/data/nonexistent"]; // Non-existent folder
    const result = createBagitFiles({ files: mockFiles, folders });
    const expectedManifest = ""; // No matching folders
    expect(result.manifest.toString()).toBe(expectedManifest);
  });

  it("should only include files from specified folders in the manifest.txt buffer", () => {
    const folders = ["C:/data/documents"]; // Only include files from documents
    const result = createBagitFiles({ files: mockFiles, folders });
    const expectedManifest = "abc123def456 data/documents/report1.pdf\n"; // Only documents
    expect(result.manifest.toString()).toBe(expectedManifest);
  });

  it("should correctly map folder names and replace paths in the manifest.txt buffer", () => {
    const folders = ["C:/data/images"];
    const result = createBagitFiles({ files: mockFiles, folders });
    const expectedManifest = "789ghi012jkl data/images/photo1.jpg\n"; // Correctly mapped
    expect(result.manifest.toString()).toBe(expectedManifest);
  });
});
