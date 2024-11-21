import {
	type FileListMongoose,
	fileListZodSchema,
	type FileListZod,
} from "@/modules/filelist/entities";
import { folderMetadataZodSchema, fileMetadataZodSchema } from "@/modules/filelist/schemas";

jest.mock("mongoose", () => {
	const originalModule = jest.requireActual("mongoose");
	return {
		...originalModule,
		model: jest.fn(() => ({
			validateSync: jest.fn(),
			save: jest.fn<Promise<FileListMongoose>, []>().mockImplementation(function (
				this: FileListMongoose,
			) {
				return Promise.resolve(this);
			}),
		})),
	};
});

describe("FileListModel and Schemas", () => {
	describe("Folder and File Metadata Zod Schema Validation", () => {
		it("should validate correct folder metadata", () => {
			const validFolderMetadata = {
				schedule: "TestSchedule",
				classification: "TestClassification",
				file: "TestFile",
				opr: true,
				startDate: "2023-01-01",
				endDate: "2023-12-31",
				soDate: "2024-01-01",
				fdDate: "2024-12-31",
			};

			expect(() => folderMetadataZodSchema.parse(validFolderMetadata)).not.toThrow();
		});

		it("should reject invalid folder metadata", () => {
			const invalidFolderMetadata = {
				schedule: "TestSchedule",
				opr: "NotBoolean", // Invalid type
			};

			expect(() => folderMetadataZodSchema.parse(invalidFolderMetadata)).toThrow();
		});

		it("should validate correct file metadata", () => {
			const validFileMetadata = {
				filepath: "/path/to/file",
				filename: "file.txt",
				size: "1024",
				birthtime: "2023-01-01T00:00:00Z",
				lastModified: "2023-01-02T00:00:00Z",
				lastAccessed: "2023-01-03T00:00:00Z",
				checksum: "abcd1234",
			};

			expect(() => fileMetadataZodSchema.parse(validFileMetadata)).not.toThrow();
		});

		it("should reject invalid file metadata", () => {
			const invalidFileMetadata = {
				filepath: "/path/to/file",
				filename: "file.txt",
				size: "1024",
				checksum: 12345, // Invalid type
			};

			expect(() => fileMetadataZodSchema.parse(invalidFileMetadata)).toThrow();
		});
	});

	describe("FileList Zod Schema Validation with Metadata", () => {
		it("should validate FileList with correct folder and file metadata", () => {
			const validFileList: FileListZod = {
				jobID: "job-123",
				outputFileType: "json",
				metadata: {
					admin: {
						application: "TestApp",
						accession: "12345",
						submittedBy: { name: "Test User", email: "test@example.com" },
					},
					folders: {
						folder1: {
							schedule: "TestSchedule",
							classification: "TestClassification",
							file: "TestFile",
							opr: true,
							startDate: "2023-01-01",
							endDate: "2023-12-31",
							soDate: "2024-01-01",
							fdDate: "2024-12-31",
						},
					},
					files: {
						file1: [
							{
								filepath: "/path/to/file",
								filename: "file.txt",
								size: "1024",
								birthtime: "2023-01-01T00:00:00Z",
								lastModified: "2023-01-02T00:00:00Z",
								lastAccessed: "2023-01-03T00:00:00Z",
								checksum: "abcd1234",
							},
						],
					},
				},
			};

			expect(() => fileListZodSchema.parse(validFileList)).not.toThrow();
		});

		it("should reject FileList with invalid metadata", () => {
			const invalidFileList = {
				jobID: "job-123",
				outputFileType: "json",
				metadata: {
					admin: {
						application: "TestApp",
						accession: "12345",
						submittedBy: { name: "Test User", email: "test@example.com" },
					},
					folders: {
						folder1: {
							schedule: "TestSchedule",
							opr: "NotBoolean", // Invalid type
						},
					},
					files: {
						file1: [
							{
								filepath: "/path/to/file",
								filename: "file.txt",
								size: "1024",
								checksum: 12345, // Invalid type
							},
						],
					},
				},
			};

			expect(() => fileListZodSchema.parse(invalidFileList)).toThrow();
		});
	});
});
