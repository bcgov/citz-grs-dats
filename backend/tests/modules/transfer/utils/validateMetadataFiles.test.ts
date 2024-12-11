import { validateMetadataFiles } from "@/modules/transfer/utils/validateMetadataFiles";
import JSZip from "jszip";

describe("validateMetadataFiles", () => {
	// Test case: Valid zip file with correct metadata
	it("should validate successfully with a valid zip file containing correct metadata", async () => {
		const zip = new JSZip();

		// Add valid "metadata/" folder and files
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		zip
			.folder("metadata")!
			.file(
				"admin.json",
				JSON.stringify({
					ministry: "Test Ministry",
					branch: "Test Branch",
					accession: "valid-accession",
					application: "valid-application",
				}),
			)
			.file(
				"files.json",
				JSON.stringify({
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
			)
			.file(
				"folders.json",
				JSON.stringify({
					folder1: {
						schedule: "2023",
						classification: "confidential",
					},
				}),
			);

		const buffer = await zip.generateAsync({ type: "nodebuffer" });

		await expect(
			validateMetadataFiles({
				buffer,
				accession: "valid-accession",
				application: "valid-application",
			}),
		).resolves.toBeUndefined();
	});

	// Test case: Missing required files in "metadata/"
	it('should throw an error if required files are missing in "metadata/"', async () => {
		const zip = new JSZip();
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		zip.folder("metadata")!.file("admin.json", "{}");
		const buffer = await zip.generateAsync({ type: "nodebuffer" });

		await expect(
			validateMetadataFiles({
				buffer,
				accession: "valid-accession",
				application: "valid-application",
			}),
		).rejects.toThrowError(
			new Error("metadata/ is missing the following required files: files.json, folders.json."),
		);
	});

	// Test case: Invalid admin.json
	it("should throw an error if admin.json is invalid", async () => {
		const zip = new JSZip();
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		zip
			.folder("metadata")!
			.file("admin.json", JSON.stringify({}))
			.file("files.json", JSON.stringify({}))
			.file("folders.json", JSON.stringify({}));
		const buffer = await zip.generateAsync({ type: "nodebuffer" });

		await expect(
			validateMetadataFiles({
				buffer,
				accession: "valid-accession",
				application: "valid-application",
			}),
		).rejects.toThrowError("Validation failed for admin.json:");
	});

	// Test case: Incorrect accession or application in admin.json
	it("should throw an error if accession or application in admin.json is incorrect", async () => {
		const zip = new JSZip();
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		zip
			.folder("metadata")!
			.file(
				"admin.json",
				JSON.stringify({
					ministry: null,
					branch: null,
					accession: "wrong-accession",
					application: "wrong-application",
				}),
			)
			.file("files.json", JSON.stringify({}))
			.file("folders.json", JSON.stringify({}));
		const buffer = await zip.generateAsync({ type: "nodebuffer" });

		await expect(
			validateMetadataFiles({
				buffer,
				accession: "valid-accession",
				application: "valid-application",
			}),
		).rejects.toThrowError("The accession or application values in admin.json are incorrect.");
	});
});
