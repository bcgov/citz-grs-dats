import crypto from "node:crypto";
import { generateChecksum } from "@/utils/generateChecksum";

describe("generateChecksum", () => {
  // Test case: Generates correct SHA-256 checksum
  it("should generate a correct SHA-256 checksum for a given buffer", () => {
    const buffer = Buffer.from("test data");
    const expectedHash = crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex");

    const checksum = generateChecksum(buffer, "sha256");

    expect(checksum).toBe(expectedHash);
  });

  // Test case: Generates correct MD5 checksum
  it("should generate a correct MD5 checksum for a given buffer", () => {
    const buffer = Buffer.from("test data");
    const expectedHash = crypto.createHash("md5").update(buffer).digest("hex");

    const checksum = generateChecksum(buffer, "md5");

    expect(checksum).toBe(expectedHash);
  });

  // Test case: Handles empty buffer correctly
  it("should generate a checksum for an empty buffer", () => {
    const buffer = Buffer.from("");
    const expectedHash = crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex");

    const checksum = generateChecksum(buffer, "sha256");

    expect(checksum).toBe(expectedHash);
  });

  // Test case: Throws error for invalid algorithm
  it("should throw an error for an unsupported algorithm", () => {
    const buffer = Buffer.from("test data");

    expect(() => generateChecksum(buffer, "invalidAlgo")).toThrow();
  });
});
