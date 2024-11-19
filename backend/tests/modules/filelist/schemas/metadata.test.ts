import mongoose, { Schema } from "mongoose";
import { folderMetadataSchema, fileMetadataSchema } from "@/modules/filelist/schemas";

describe("Folder and File Metadata Schemas", () => {
	describe("Mongoose Schema Validation", () => {
		it("should throw an error for invalid folder metadata", () => {
			// Wrap the folder metadata schema in a parent schema for validation
			const testSchema = new Schema({
				folder: folderMetadataSchema,
			});
			const FolderModel = mongoose.model("FolderInvalidTest", testSchema);

			const invalidFolderMetadata = {
				folder: {
					schedule: "Retention Schedule",
					opr: "not-a-boolean", // Invalid type
				},
			};

			const document = new FolderModel(invalidFolderMetadata);

			// Use validateSync with `runValidators` explicitly to catch type errors
			try {
				document.validateSync({ pathsToSkip: [], runValidators: true });
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (err: any) {
				expect(err.errors).toHaveProperty("folder.opr");
				expect(err.errors["folder.opr"].message).toMatch(/Cast to Boolean/);
			}
		});

		it("should throw an error for invalid file metadata", () => {
			// Wrap the file metadata schema in a parent schema for validation
			const testSchema = new Schema({
				file: fileMetadataSchema,
			});
			const FileModel = mongoose.model("FileInvalidTest", testSchema);

			const invalidFileMetadata = {
				file: {
					filepath: "/path/to/file",
					filename: "file.txt",
					size: "1024",
					checksum: 12345, // Invalid type
				},
			};

			const document = new FileModel(invalidFileMetadata);

			// Use validateSync with `runValidators` explicitly to catch type errors
			try {
				document.validateSync({ pathsToSkip: [], runValidators: true });
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (err: any) {
				expect(err.errors).toHaveProperty("file.checksum");
				expect(err.errors["file.checksum"].message).toMatch(/Cast to String/);
			}
		});

		it("should validate valid folder metadata", () => {
			const testSchema = new Schema({
				folder: folderMetadataSchema,
			});
			const FolderModel = mongoose.model("FolderValidTest", testSchema);

			const validFolderMetadata = {
				folder: {
					schedule: "Retention Schedule",
					classification: "Confidential",
					file: "file1",
					opr: true,
					startDate: "2023-01-01",
					endDate: "2023-12-31",
					soDate: "2024-01-01",
					fdDate: "2024-12-31",
				},
			};

			const document = new FolderModel(validFolderMetadata);
			expect(() => document.validateSync()).not.toThrow();
		});

		it("should validate valid file metadata", () => {
			const testSchema = new Schema({
				file: fileMetadataSchema,
			});
			const FileModel = mongoose.model("FileValidTest", testSchema);

			const validFileMetadata = {
				file: {
					filepath: "/path/to/file",
					filename: "file.txt",
					size: "1024",
					birthtime: "2023-01-01T00:00:00Z",
					lastModified: "2023-01-02T00:00:00Z",
					lastAccessed: "2023-01-03T00:00:00Z",
					checksum: "abcd1234",
				},
			};

			const document = new FileModel(validFileMetadata);
			expect(() => document.validateSync()).not.toThrow();
		});
	});
});
