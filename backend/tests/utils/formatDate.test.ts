import { formatDate } from "@/utils";

describe("formatDate", () => {
	it("should return an empty string if date is undefined", () => {
		expect(formatDate(undefined)).toBe("");
	});

	it("should return an empty string if date is null", () => {
		expect(formatDate(null)).toBe("");
	});

	it("should return an empty string if date is an empty string", () => {
		expect(formatDate("")).toBe("");
	});

	it("should format a valid ISO date string to YYYY-MM-DD", () => {
		expect(formatDate("2024-11-25T00:00:00Z")).toBe("2024-11-25");
	});

	it("should format a valid date string in YYYY/MM/DD to YYYY-MM-DD", () => {
		expect(formatDate("2024/11/25")).toBe("2024-11-25");
	});

	it("should return an empty string for unexpected non-ISO formats", () => {
		expect(formatDate("Invalid Date Format")).toBe("");
	});

	it("should handle leap year dates correctly", () => {
		expect(formatDate("2024-02-29T12:00:00Z")).toBe("2024-02-29");
	});

	it("should correctly format non-UTC ISO times", () => {
		expect(formatDate("2024-11-25T23:59:59-08:00")).toBe("2024-11-26");
	});

	it("should handle YYYY/MM/DD format with extra spaces", () => {
		expect(formatDate(" 2024 / 11 / 25 ")).toBe("2024-11-25");
	});

	it("should return an empty string if the YYYY/MM/DD format is incomplete", () => {
		expect(formatDate("2024/11")).toBe("");
	});
});
