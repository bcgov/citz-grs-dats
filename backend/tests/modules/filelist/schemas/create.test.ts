import { createFileListBodySchema, type CreateFileListBody } from "@/modules/filelist/schemas";

describe("createFileListBodySchema", () => {
	it("should validate correct input", () => {
		const validInput: CreateFileListBody = {
			outputFileType: "pdf",
			metadata: {
				admin: {
					application: "TestApp",
					accession: "12345",
				},
				folders: {
					folder1: {
						schedule: "Retention Schedule",
						classification: "Confidential",
						file: "file1",
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

		expect(() => createFileListBodySchema.parse(validInput)).not.toThrow();
	});

	it("should reject input with missing required fields", () => {
		const invalidInput = {
			metadata: {
				folders: {
					folder1: {
						schedule: "Retention Schedule",
					},
				},
				files: {
					file1: [
						{
							filepath: "/path/to/file",
							filename: "file.txt",
							size: "1024",
							checksum: "abcd1234",
						},
					],
				},
			},
		};

		expect(() => createFileListBodySchema.parse(invalidInput)).toThrow(/outputFileType/);
	});

	it("should reject input with invalid folder metadata", () => {
		const invalidInput = {
			outputFileType: "pdf",
			metadata: {
				folders: {
					folder1: {
						schedule: "Retention Schedule",
						opr: "not-a-boolean", // Invalid type
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

		expect(() => createFileListBodySchema.parse(invalidInput)).toThrow(/opr/);
	});

	it("should reject input with invalid file metadata", () => {
		const invalidInput = {
			outputFileType: "pdf",
			metadata: {
				folders: {
					folder1: {
						schedule: "Retention Schedule",
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

		expect(() => createFileListBodySchema.parse(invalidInput)).toThrow(/checksum/);
	});

	it("should allow missing optional admin metadata", () => {
		const validInput: CreateFileListBody = {
			outputFileType: "pdf",
			metadata: {
				folders: {
					folder1: {
						schedule: "Retention Schedule",
						classification: "Confidential",
						file: "file1",
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

		expect(() => createFileListBodySchema.parse(validInput)).not.toThrow();
	});
});
