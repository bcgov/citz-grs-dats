import { formatFileSize } from "@/utils/formatFileSize";

// Test suite for formatFileSize
describe("formatFileSize", () => {
  // Test case: Formats bytes correctly
  it("should return size in bytes for values less than 1024", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(0)).toBe("0 B");
  });

  // Test case: Formats kilobytes correctly
  it("should return size in KB for values between 1KB and 1MB", () => {
    expect(formatFileSize(1024)).toBe("1.00 KB");
    expect(formatFileSize(1536)).toBe("1.50 KB");
  });

  // Test case: Formats megabytes correctly
  it("should return size in MB for values between 1MB and 1GB", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.00 MB");
    expect(formatFileSize(5.5 * 1024 * 1024)).toBe("5.50 MB");
  });

  // Test case: Formats gigabytes correctly
  it("should return size in GB for values between 1GB and 1TB", () => {
    expect(formatFileSize(1024 ** 3)).toBe("1.00 GB");
    expect(formatFileSize(1.5 * 1024 ** 3)).toBe("1.50 GB");
  });

  // Test case: Formats terabytes correctly
  it("should return size in TB for values between 1TB and 1PB", () => {
    expect(formatFileSize(1024 ** 4)).toBe("1.00 TB");
    expect(formatFileSize(2.75 * 1024 ** 4)).toBe("2.75 TB");
  });

  // Test case: Handles large and fractional values gracefully
  it("should round to two decimal places", () => {
    expect(formatFileSize(123456)).toBe("120.56 KB");
    expect(formatFileSize(987654321)).toBe("941.90 MB");
  });
});
