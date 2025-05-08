import type { Readable } from "node:stream";
import crypto from "node:crypto";

export const generateChecksum = async (
  stream: Readable,
  algorithm = "sha256"
): Promise<string> => {
  const hash = crypto.createHash(algorithm);

  return new Promise((resolve, reject) => {
    stream
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")))
      .on("error", (err) => reject(err));
  });
};
