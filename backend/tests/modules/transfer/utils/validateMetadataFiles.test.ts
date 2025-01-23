import { validateMetadataFiles } from "@/modules/transfer/utils/validateMetadataFiles";
import { Buffer } from "node:buffer";
import yazl from "yazl";

describe("validateMetadataFiles", () => {
  // Helper function to create a zip buffer using yazl (compatible with yauzl for reading)
  const createZipBuffer = (files: Record<string, string>): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = [];
      const zipFile = new yazl.ZipFile();

      for (const [filePath, content] of Object.entries(files)) {
        zipFile.addBuffer(Buffer.from(content), filePath);
      }

      zipFile.outputStream
        .on("data", (chunk) => buffers.push(chunk))
        .on("end", () => resolve(Buffer.concat(buffers)))
        .on("error", (err) => reject(err));

      zipFile.end();
    });
  };

  // Test case: Valid zip file with correct metadata
  it("should validate successfully with a valid zip file containing correct metadata", async () => {
    const files = {
      "metadata/admin.json": JSON.stringify({
        accession: "valid-accession",
        application: "valid-application",
        submittedBy: {
          name: "",
          email: "",
        },
      }),
      "metadata/files.json": JSON.stringify({
        file1: [
          {
            filepath: "/path/to/file",
            filename: "file.txt",
            size: "1234",
            checksum: "abcd1234",
            birthtime: "2023-01-01",
            lastModified: "2023-01-01",
            lastAccessed: "2023-01-01",
          },
        ],
      }),
      "metadata/folders.json": JSON.stringify({
        folder1: {
          schedule: "2023",
          classification: "confidential",
        },
      }),
    };

    const buffer = await createZipBuffer(files);

    await expect(
      validateMetadataFiles({
        buffer,
        accession: "valid-accession",
        application: "valid-application",
      })
    ).resolves.toBeUndefined();
  });

  // Test case: Missing required files in "metadata/"
  it('should throw an error if required files are missing in "metadata/"', async () => {
    const files = {
      "metadata/admin.json": "{}",
    };

    const buffer = await createZipBuffer(files);

    await expect(
      validateMetadataFiles({
        buffer,
        accession: "valid-accession",
        application: "valid-application",
      })
    ).rejects.toThrowError(
      /The zip file is missing required file: metadata\/files\.json/
    );
  });

  // Test case: Invalid admin.json
  it("should throw an error if admin.json is invalid", async () => {
    const files = {
      "metadata/admin.json": JSON.stringify({}),
      "metadata/files.json": JSON.stringify({}),
      "metadata/folders.json": JSON.stringify({}),
    };

    const buffer = await createZipBuffer(files);

    await expect(
      validateMetadataFiles({
        buffer,
        accession: "valid-accession",
        application: "valid-application",
      })
    ).rejects.toThrowError(/Validation failed for admin\.json/);
  });

  // Test case: Incorrect accession or application in admin.json
  it("should throw an error if accession or application in admin.json is incorrect", async () => {
    const files = {
      "metadata/admin.json": JSON.stringify({
        accession: "wrong-accession",
        application: "wrong-application",
        submittedBy: {
          name: "",
          email: "",
        },
      }),
      "metadata/files.json": JSON.stringify({}),
      "metadata/folders.json": JSON.stringify({}),
    };

    const buffer = await createZipBuffer(files);

    await expect(
      validateMetadataFiles({
        buffer,
        accession: "valid-accession",
        application: "valid-application",
      })
    ).rejects.toThrowError(
      /The accession or application values in admin\.json are incorrect/
    );
  });
});
