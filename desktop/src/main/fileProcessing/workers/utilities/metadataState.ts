import { promises as fsPromises } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const { writeFile, readFile, unlink, mkdir, rename } = fsPromises;

export class NetworkError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = "NetworkError";
  }
}

export type MetadataStateFile = {
  sourcePath: string;
  originalSource: string;
  totalFileCount: number;
  processedCount: number;
  totalSize: number;
  processedFiles: Record<
    string,
    {
      metadataEntry: Record<string, unknown>;
      extendedMetadataEntry?: Record<string, unknown>;
    }
  >;
};

const NETWORK_ERROR_CODES = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTCONN",
  "EIO",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "ENOTFOUND",
  "UNKNOWN",
]);

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof NetworkError) return true;
  if (error && typeof error === "object" && "code" in error) {
    return NETWORK_ERROR_CODES.has((error as { code: string }).code);
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("network") ||
      msg.includes("vpn") ||
      msg.includes("connection was refused") ||
      msg.includes("connection has been reset") ||
      msg.includes("no such host") ||
      msg.includes("unknown error") ||
      msg.includes("path not found") ||
      msg.includes("the specified network name")
    );
  }
  return false;
};

export const getStateFilePath = (
  sourcePath: string,
  cacheDir: string
): string => {
  const hash = crypto
    .createHash("sha256")
    .update(sourcePath)
    .digest("hex");
  return path.join(cacheDir, `${hash}.json`);
};

export const saveMetadataState = async (
  stateFilePath: string,
  state: MetadataStateFile,
  retries = 1
): Promise<void> => {
  const dir = path.dirname(stateFilePath);
  const tempPath = `${stateFilePath}.tmp`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await mkdir(dir, { recursive: true });
      await writeFile(tempPath, JSON.stringify(state, null, 2), "utf-8");
      await rename(tempPath, stateFilePath);
      return;
    } catch (err) {
      const isENOENT =
        err instanceof Error &&
        "code" in err &&
        (err as NodeJS.ErrnoException).code === "ENOENT";
      if (attempt < retries && isENOENT) {
        console.warn("[MetadataState] ENOENT while saving state, retrying...");
        continue;
      }
      throw err;
    }
  }
};

export const loadMetadataState = async (
  stateFilePath: string
): Promise<MetadataStateFile | null> => {
  try {
    const data = await readFile(stateFilePath, "utf-8");
    return JSON.parse(data) as MetadataStateFile;
  } catch {
    return null;
  }
};

export const deleteMetadataState = async (
  stateFilePath: string
): Promise<void> => {
  try {
    await unlink(stateFilePath);
  } catch {
    // Ignore if file doesn't exist
  }
};
