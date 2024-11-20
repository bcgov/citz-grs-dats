import { ZodError } from "zod";
import { EmailDataSchema } from "@/modules/ches/schemas";

describe("Test suite for EmailDataSchema", () => {
	it("Test case: Should throw an error for missing required fields", () => {
		const invalidData = {
			subject: "Test Email",
			to: ["recipient@example.com"],
			delayTS: 1666666666,
		};

		try {
			EmailDataSchema.parse(invalidData);
		} catch (error) {
			if (error instanceof ZodError) {
				expect(error.errors).toEqual(
					expect.arrayContaining([
						expect.objectContaining({
							path: ["body"],
							message: "Required",
						}),
					]),
				);
			} else {
				throw error; // Re-throw if it's not a ZodError
			}
		}
	});

	it("Test case: Should throw an error for invalid attachment structure", () => {
		const invalidData = {
			attachments: [
				{
					content: "base64encodedcontent",
					encoding: "base64",
					filename: "document.pdf",
				}, // Missing contentType
			],
			body: "This is an email body",
			subject: "Test Email",
			to: ["recipient@example.com"],
		};

		try {
			EmailDataSchema.parse(invalidData);
		} catch (error) {
			if (error instanceof ZodError) {
				expect(error.errors).toEqual(
					expect.arrayContaining([
						expect.objectContaining({
							path: ["attachments", 0, "contentType"],
							message: "Required",
						}),
					]),
				);
			} else {
				throw error;
			}
		}
	});

	it("Test case: Should validate email addresses in arrays", () => {
		const invalidData = {
			bcc: ["not-an-email"],
			body: "This is an email body",
			subject: "Test Email",
			to: ["recipient@example.com"],
		};

		try {
			EmailDataSchema.parse(invalidData);
		} catch (error) {
			if (error instanceof ZodError) {
				expect(error.errors).toEqual(
					expect.arrayContaining([
						expect.objectContaining({
							path: ["bcc", 0],
							message: expect.any(String), // Adjust based on custom error messages
						}),
					]),
				);
			} else {
				throw error;
			}
		}
	});

	it("Test case: Should validate enum values for bodyType and priority", () => {
		const invalidData = {
			bodyType: "invalid", // Invalid value for bodyType
			priority: "urgent", // Invalid value for priority
			body: "This is an email body",
			subject: "Test Email",
			to: ["recipient@example.com"],
		};

		try {
			EmailDataSchema.parse(invalidData);
		} catch (error) {
			if (error instanceof ZodError) {
				expect(error.errors).toEqual(
					expect.arrayContaining([
						expect.objectContaining({
							path: ["bodyType"],
							message: "Invalid enum value. Expected 'html' | 'text', received 'invalid'",
							code: "invalid_enum_value",
							received: "invalid",
						}),
						expect.objectContaining({
							path: ["priority"],
							message: "Invalid enum value. Expected 'low' | 'normal' | 'high', received 'urgent'",
							code: "invalid_enum_value",
							received: "urgent",
						}),
					]),
				);
			} else {
				throw error;
			}
		}
	});
});
