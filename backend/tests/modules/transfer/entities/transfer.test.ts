import {
	TransferModel,
	transferZodSchema,
	type TransferMongoose,
	type TransferZod,
} from "@/modules/transfer/entities";

describe("Transfer Schema and Zod Validation", () => {
	describe("Mongoose Schema Validation", () => {
		it("should validate a valid Transfer document", () => {
			const validTransfer: TransferMongoose = {
				metadata: {
					admin: {
						application: "TestApp",
						accession: "12345",
						submittedBy: {
							name: "Test User",
							email: "test@example.com",
						},
					},
					folders: { folder1: "data1", folder2: "data2" },
					files: { file1: ["data1"], file2: ["data2"] },
				},
			};

			const transferDocument = new TransferModel(validTransfer);
			expect(() => transferDocument.validateSync()).not.toThrow();
		});

		it("should reject a Transfer document with missing required fields", () => {
			const invalidTransfer = {
				metadata: {
					admin: {
						application: "TestApp",
						// Missing required field `accession`
						submittedBy: {
							name: "Test User",
							email: "test@example.com",
						},
					},
					folders: { folder1: "data1" },
					files: { file1: ["data1"] },
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
					folders: { folder1: "data1", folder2: "data2" },
					files: { file1: ["data1"], file2: ["data2"] },
				},
			};

			expect(() => transferZodSchema.parse(validTransfer)).not.toThrow();
		});

		it("should reject input with missing required fields using Zod schema", () => {
			const invalidTransfer = {
				metadata: {
					admin: {
						application: "TestApp",
						// Missing `accession`
						submittedBy: {
							name: "Test User",
							email: "test@example.com",
						},
					},
					folders: { folder1: "data1" },
					files: { file1: ["data1"] },
				},
			};

			expect(() => transferZodSchema.parse(invalidTransfer)).toThrow(/accession/);
		});
	});
});
