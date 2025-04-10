import { createHash } from "node:crypto";

export const createChecksumHasher = () => {
  const hash = createHash("sha256");

  return {
    update: (chunk: Uint8Array | Buffer) => {
      hash.update(chunk as unknown as Uint8Array);
    },
    digest: (): string => {
      return hash.digest("hex");
    },
  };
};
