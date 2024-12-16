import { z } from "zod";
import { createTransferBodySchema } from "@/modules/transfer/schemas";

// Test suite for createTransferBodySchema
describe("createTransferBodySchema", () => {
	// Test case: Validates a correct input
	it("should validate a valid input", () => {
		const validData = {
			buffer: Buffer.from("test"),
			application: "TestApplication",
			accession: "TestAccession",
		};

		expect(() => createTransferBodySchema.parse(validData)).not.toThrow();
	});

	// Test case: Ensures buffer accepts any type
	it("should validate when buffer is of any type", () => {
		const validData = {
			buffer: "SomeString", // Can be any type
			application: "TestApplication",
			accession: "TestAccession",
		};

		expect(() => createTransferBodySchema.parse(validData)).not.toThrow();
	});

	// Test case: Throws an error when application is missing
	it("should throw an error when application is missing", () => {
		const invalidData = {
			buffer: Buffer.from("test"),
			accession: "TestAccession",
		};

		expect(() => createTransferBodySchema.parse(invalidData)).toThrow(z.ZodError);
	});

	// Test case: Throws an error when accession is missing
	it("should throw an error when accession is missing", () => {
		const invalidData = {
			buffer: Buffer.from("test"),
			application: "TestApplication",
		};

		expect(() => createTransferBodySchema.parse(invalidData)).toThrow(z.ZodError);
	});
});
