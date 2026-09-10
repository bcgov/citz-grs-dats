import crypto, { type BinaryLike } from "node:crypto";
import { createReadStream } from "node:fs";
import type { HashAlgorithm } from "./progressReporter";

export const calculateChecksum = async (
  filePath: string,
  algorithm: HashAlgorithm = "sha256",
  highWaterMark?: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const opts = highWaterMark ? { highWaterMark } : undefined;
    const input = createReadStream(filePath, opts);

    input.on("data", (chunk) => hash.update(chunk as BinaryLike));
    input.on("end", () => resolve(hash.digest("hex")));
    input.on("error", reject);
  });
};

export const calculateChecksums = async (
  filePath: string,
  algorithms: HashAlgorithm[],
  highWaterMark?: number
): Promise<Record<string, string>> => {
  return new Promise((resolve, reject) => {
    const hashes = algorithms.map((alg) => crypto.createHash(alg));
    const opts = highWaterMark ? { highWaterMark } : undefined;
    const input = createReadStream(filePath, opts);

    input.on("data", (chunk) => {
      for (const hash of hashes) {
        hash.update(chunk as BinaryLike);
      }
    });
    input.on("end", () => {
      const result: Record<string, string> = {};
      for (let i = 0; i < algorithms.length; i++) {
        result[algorithms[i]] = hashes[i]!.digest("hex");
      }
      resolve(result);
    });
    input.on("error", reject);
  });
};
