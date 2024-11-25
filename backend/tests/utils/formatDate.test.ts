import { formatDate } from "@/utils";

describe("formatDate", () => {
	// Test case: Return an empty string if date is undefined or null
	it("should return an empty string if date is undefined", () => {
		expect(formatDate(undefined)).toBe("");
	});

	it("should return an empty string if date is null", () => {
		expect(formatDate(null)).toBe("");
	});

	it("should return an empty string if date is an empty string", () => {
		expect(formatDate("")).toBe("");
	});

	// Test case: Handle valid ISO date string
	it("should format a valid ISO date string to YYYY-MM-DD", () => {
		expect(formatDate("2024-11-25T00:00:00Z")).toBe("2024-11-25");
	});

	// Test case: Handle valid date string from toDateString
	it("should format a valid date string from toDateString to YYYY-MM-DD", () => {
		const dateString = new Date("2024-11-25").toDateString();
		expect(formatDate(dateString)).toBe("2024-11-25");
	});

	// Test case: Return the original string for invalid date
	it("should return the original string if the date is invalid", () => {
		expect(formatDate("Invalid Date String")).toBe("Invalid Date String");
	});

	// Test case: Handle edge cases like leap year
	it("should handle leap year dates correctly", () => {
		expect(formatDate("2024-02-29T12:00:00Z")).toBe("2024-02-29");
	});

	// Test case: Handle non-UTC times
	it("should correctly format non-UTC times", () => {
		expect(formatDate("2024-11-25T23:59:59-08:00")).toBe("2024-11-26");
	});
});
