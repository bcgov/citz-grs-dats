import crypto, { type BinaryLike } from "node:crypto";
import { createReadStream } from "node:fs";

export const calculateChecksum = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const input = createReadStream(filePath);

    input.on("data", (chunk) => hash.update(chunk as BinaryLike));
    input.on("end", () => resolve(hash.digest("hex")));
    input.on("error", reject);
  });
};
