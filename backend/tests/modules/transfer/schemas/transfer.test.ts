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

	// Test case: Ensures optional fields can be undefined
	it("should validate when optional fields are undefined", () => {
		const validData = {
			buffer: Buffer.from("test"),
		};

		expect(() => createTransferBodySchema.parse(validData)).not.toThrow();
	});

	// Test case: Fails when buffer is not an instance of Buffer
	it("should throw an error when buffer is not a Buffer", () => {
		const invalidData = {
			buffer: "NotABuffer",
			application: "TestApplication",
			accession: "TestAccession",
		};

		expect(() => createTransferBodySchema.parse(invalidData)).toThrow(z.ZodError);
	});
});
