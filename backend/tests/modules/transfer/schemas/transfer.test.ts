import { z } from "zod";
import { createTransferBodySchema } from "@/modules/transfer/schemas";

// Test suite for createTransferBodySchema
describe("createTransferBodySchema", () => {
  // Test case: Validates a correct input
  it("should validate a valid input", () => {
    const validData = {
      application: "MyApp",
      accession: "ACC123",
      chunkIndex: "0",
      totalChunks: "3",
      contentChecksum: "abc123",
    };

    expect(() => createTransferBodySchema.parse(validData)).not.toThrow();
  });

  // Test case: Throws error when required field is missing
  it("should throw an error when application is missing", () => {
    const invalidData = {
      accession: "ACC123",
      chunkIndex: "0",
      totalChunks: "3",
      contentChecksum: "abc123",
    };

    expect(() => createTransferBodySchema.parse(invalidData)).toThrow(
      z.ZodError
    );
  });

  // Test case: Throws error when accession is missing
  it("should throw an error when accession is missing", () => {
    const invalidData = {
      application: "MyApp",
      chunkIndex: "0",
      totalChunks: "3",
      contentChecksum: "abc123",
    };

    expect(() => createTransferBodySchema.parse(invalidData)).toThrow(
      z.ZodError
    );
  });

  // Test case: Throws error when chunkIndex is missing
  it("should throw an error when chunkIndex is missing", () => {
    const invalidData = {
      application: "MyApp",
      accession: "ACC123",
      totalChunks: "3",
      contentChecksum: "abc123",
    };

    expect(() => createTransferBodySchema.parse(invalidData)).toThrow(
      z.ZodError
    );
  });

  // Test case: Throws error when totalChunks is missing
  it("should throw an error when totalChunks is missing", () => {
    const invalidData = {
      application: "MyApp",
      accession: "ACC123",
      chunkIndex: "0",
      contentChecksum: "abc123",
    };

    expect(() => createTransferBodySchema.parse(invalidData)).toThrow(
      z.ZodError
    );
  });

  // Test case: Throws error when contentChecksum is missing
  it("should throw an error when contentChecksum is missing", () => {
    const invalidData = {
      application: "MyApp",
      accession: "ACC123",
      chunkIndex: "0",
      totalChunks: "3",
    };

    expect(() => createTransferBodySchema.parse(invalidData)).toThrow(
      z.ZodError
    );
  });
});
