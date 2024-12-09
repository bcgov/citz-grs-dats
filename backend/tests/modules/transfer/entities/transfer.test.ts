import { TransferModel, transferZodSchema, type TransferZod } from "@/modules/transfer/entities";

describe("Transfer Schema and Zod Validation", () => {
	describe("Mongoose Schema Validation", () => {
		it("should validate a valid Transfer document", () => {
			const validTransfer = {
				status: "Pre-Transfer",
				metadata: {
					admin: {
						application: "TestApp",
						accession: "12345",
						submittedBy: {
							name: "Test User",
							email: "test@example.com",
						},
					},
					folders: new Map([
						[
							"folder1",
							{
								schedule: "Schedule A",
								classification: "Class A",
								file: "File A",
								opr: true,
								startDate: "2023-01-01",
								endDate: "2023-12-31",
								soDate: null,
								fdDate: "2024-01-01",
							},
						],
					]),
					files: new Map([
						[
							"file1",
							[
								new TransferModel({
									filepath: "/path/to/file1",
									filename: "file1.txt",
									size: "10KB",
									birthtime: "2023-01-01",
									lastModified: "2023-11-15",
									lastAccessed: "2023-11-16",
									checksum: "abc123",
								}).metadata?.files?.get("file1"),
							],
						],
					]),
				},
			};

			const transferDocument = new TransferModel(validTransfer);
			expect(() => transferDocument.validateSync()).not.toThrow();
		});

		it("should reject a Transfer document with missing required fields", () => {
			const invalidTransfer = {
				status: "Pre-Transfer",
				metadata: {
					admin: {
						application: "TestApp",
						// Missing required field `accession`
						submittedBy: {
							name: "Test User",
							email: "test@example.com",
						},
					},
					folders: new Map([
						[
							"folder1",
							{
								classification: "Class A",
								file: "File A",
							},
						],
					]),
					files: new Map([
						[
							"file1",
							[
								{
									filepath: "/path/to/file1",
									filename: "file1.txt",
									size: "10KB",
								},
							],
						],
					]),
				},
			};

			const transferDocument = new TransferModel(invalidTransfer);

			try {
				transferDocument.validateSync();
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (err: any) {
				expect(err.errors).toHaveProperty("metadata.admin.accession");
				expect(err.errors["metadata.admin.accession"].message).toMatch(/required/);
			}
		});
	});

	describe("Zod Schema Validation", () => {
		it("should validate correct input using Zod schema", () => {
			const validTransfer: TransferZod = {
				status: "Pre-Transfer",
				createdOn: "2023-11-17",
				metadata: {
					admin: {
						application: "TestApp",
						accession: "12345",
						submittedBy: {
							name: "Test User",
							email: "test@example.com",
						},
					},
					folders: {
						folder1: {
							schedule: "Schedule A",
							classification: "Class A",
							file: "File A",
							opr: true,
							startDate: "2023-01-01",
							endDate: "2023-12-31",
							soDate: null,
							fdDate: "2024-01-01",
						},
						folder2: {
							schedule: null,
							classification: "Class B",
							file: "File B",
							opr: false,
							startDate: null,
							endDate: "2023-06-30",
							soDate: "2023-07-01",
							fdDate: null,
						},
					},
					files: {
						file1: [
							{
								filepath: "/path/to/file1",
								filename: "file1.txt",
								size: "10KB",
								birthtime: "2023-01-01",
								lastModified: "2023-11-15",
								lastAccessed: "2023-11-16",
								checksum: "abc123",
							},
						],
						file2: [
							{
								filepath: "/path/to/file2",
								filename: "file2.txt",
								size: "20KB",
								birthtime: "2023-01-02",
								lastModified: "2023-11-14",
								lastAccessed: "2023-11-15",
								checksum: "def456",
							},
						],
					},
				},
			};

			expect(() => transferZodSchema.parse(validTransfer)).not.toThrow();
		});

		it("should reject input with missing required fields using Zod schema", () => {
			const invalidTransfer = {
				status: "Pre-Transfer",
				metadata: {
					admin: {
						application: "TestApp",
						// Missing `accession`
						submittedBy: {
							name: "Test User",
							email: "test@example.com",
						},
					},
					folders: {
						folder1: {
							classification: "Class A",
							file: "File A",
						},
					},
					files: {
						file1: [
							{
								filepath: "/path/to/file1",
								filename: "file1.txt",
								size: "10KB",
							},
						],
					},
				},
			};

			expect(() => transferZodSchema.parse(invalidTransfer)).toThrow(/accession/);
		});
	});
});
