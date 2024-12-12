import { adminMetadataZodSchema } from "@/modules/transfer/schemas";
import { z } from "zod";

describe("adminMetadataZodSchema", () => {
	it("should validate a correct admin metadata object", () => {
		const validData = {
			accession: "ACC-1234",
			application: "App-01",
		};

		expect(() => adminMetadataZodSchema.parse(validData)).not.toThrow();
	});

	it("should throw an error if required fields are missing", () => {
		const invalidData = {
			ministry: "Ministry of Education",
			branch: "HR Branch",
		};

		expect(() => adminMetadataZodSchema.parse(invalidData)).toThrowError(z.ZodError);
	});

	it("should throw an error if accession is not a string", () => {
		const invalidData = {
			accession: 12345, // Invalid type
			application: "App-04",
		};

		expect(() => adminMetadataZodSchema.parse(invalidData)).toThrowError(z.ZodError);
	});

	it("should throw an error if application is not a string", () => {
		const invalidData = {
			accession: "ACC-121314",
			application: 67890, // Invalid type
		};

		expect(() => adminMetadataZodSchema.parse(invalidData)).toThrowError(z.ZodError);
	});
});
