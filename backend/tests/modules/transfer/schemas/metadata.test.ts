import { adminMetadataZodSchema } from "@/modules/transfer/schemas";
import { z } from "zod";

describe("adminMetadataZodSchema", () => {
	it("should validate a correct admin metadata object", () => {
		const validData = {
			ministry: "Ministry of Health",
			branch: "IT Branch",
			accession: "ACC-1234",
			application: "App-01",
		};

		expect(() => adminMetadataZodSchema.parse(validData)).not.toThrow();
	});

	it("should validate when optional fields are missing", () => {
		const validData = {
			accession: "ACC-5678",
			application: "App-02",
		};

		expect(() => adminMetadataZodSchema.parse(validData)).not.toThrow();
	});

	it("should validate when optional fields are null", () => {
		const validData = {
			ministry: null,
			branch: null,
			accession: "ACC-91011",
			application: "App-03",
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
			ministry: "Ministry of Finance",
			branch: "Admin Branch",
			accession: 12345, // Invalid type
			application: "App-04",
		};

		expect(() => adminMetadataZodSchema.parse(invalidData)).toThrowError(z.ZodError);
	});

	it("should throw an error if application is not a string", () => {
		const invalidData = {
			ministry: "Ministry of Transportation",
			branch: "Operations Branch",
			accession: "ACC-121314",
			application: 67890, // Invalid type
		};

		expect(() => adminMetadataZodSchema.parse(invalidData)).toThrowError(z.ZodError);
	});

	it("should throw an error if ministry is not a string or null", () => {
		const invalidData = {
			ministry: 123, // Invalid type
			branch: "IT Branch",
			accession: "ACC-151617",
			application: "App-05",
		};

		expect(() => adminMetadataZodSchema.parse(invalidData)).toThrowError(z.ZodError);
	});

	it("should throw an error if branch is not a string or null", () => {
		const invalidData = {
			ministry: "Ministry of Environment",
			branch: 456, // Invalid type
			accession: "ACC-181920",
			application: "App-06",
		};

		expect(() => adminMetadataZodSchema.parse(invalidData)).toThrowError(z.ZodError);
	});
});
