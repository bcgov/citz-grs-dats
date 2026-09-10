import { promises as fsPromises } from "node:fs";
import crypto from "node:crypto";
import type { HashAlgorithm } from "./progressReporter";

const { open } = fsPromises;

export const calculateFingerprint = async (
  filePath: string,
  algorithm: HashAlgorithm,
  fileSize: number,
  lastModified: Date,
  fingerprintSize: number
): Promise<string> => {
  const hash = crypto.createHash(algorithm);

  const fh = await open(filePath, "r");
  try {
    const readSize = Math.min(fingerprintSize, fileSize);

    const startBuf = Buffer.alloc(readSize);
    const { bytesRead: startRead } = await fh.read(
      startBuf,
      0,
      readSize,
      0
    );
    hash.update(startBuf.subarray(0, startRead));

    if (fileSize > readSize) {
      const endBuf = Buffer.alloc(readSize);
      const { bytesRead: endRead } = await fh.read(
        endBuf,
        0,
        readSize,
        Math.max(0, fileSize - readSize)
      );
      hash.update(endBuf.subarray(0, endRead));
    }

    hash.update(lastModified.toISOString());
    hash.update(String(fileSize));
  } finally {
    await fh.close();
  }

  return hash.digest("hex");
};

export const calculateFingerprints = async (
  filePath: string,
  algorithms: HashAlgorithm[],
  fileSize: number,
  lastModified: Date,
  fingerprintSize: number
): Promise<Record<string, string>> => {
  const hashes = algorithms.map((alg) => crypto.createHash(alg));

  const fh = await open(filePath, "r");
  try {
    const readSize = Math.min(fingerprintSize, fileSize);

    const startBuf = Buffer.alloc(readSize);
    const { bytesRead: startRead } = await fh.read(
      startBuf,
      0,
      readSize,
      0
    );
    const startData = startBuf.subarray(0, startRead);

    let endData: Uint8Array | undefined;
    if (fileSize > readSize) {
      const endBuf = Buffer.alloc(readSize);
      const { bytesRead: endRead } = await fh.read(
        endBuf,
        0,
        readSize,
        Math.max(0, fileSize - readSize)
      );
      endData = endBuf.subarray(0, endRead);
    }

    const metaA = lastModified.toISOString();
    const metaB = String(fileSize);

    for (const hash of hashes) {
      hash.update(startData);
      if (endData) hash.update(endData);
      hash.update(metaA);
      hash.update(metaB);
    }
  } finally {
    await fh.close();
  }

  const result: Record<string, string> = {};
  for (let i = 0; i < algorithms.length; i++) {
    result[algorithms[i]!] = hashes[i]!.digest("hex");
  }
  return result;
};
