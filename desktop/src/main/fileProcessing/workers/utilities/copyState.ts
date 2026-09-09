import { promises as fsPromises } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const { writeFile, readFile, unlink, mkdir, rename } = fsPromises;

export type CopyStateFile = {
  sourcePath: string;
  originalSource: string;
  totalFileCount: number;
  processedCount: number;
  processedFiles: Record<
    string,
    {
      filePath: string;
      size: number;
    }
  >;
  tempDir: string | null;
};

export const getCopyStateFilePath = (
  sourcePath: string,
  cacheDir: string
): string => {
  const hash = crypto
    .createHash("sha256")
    .update(`copy-${sourcePath}`)
    .digest("hex");
  return path.join(cacheDir, `${hash}.json`);
};

export const saveCopyState = async (
  stateFilePath: string,
  state: CopyStateFile,
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
        console.warn("[CopyState] ENOENT while saving state, retrying...");
        continue;
      }
      throw err;
    }
  }
};

export const loadCopyState = async (
  stateFilePath: string
): Promise<CopyStateFile | null> => {
  try {
    const data = await readFile(stateFilePath, "utf-8");
    return JSON.parse(data) as CopyStateFile;
  } catch {
    return null;
  }
};

export const deleteCopyState = async (
  stateFilePath: string
): Promise<void> => {
  try {
    await unlink(stateFilePath);
  } catch {
    // Ignore if file doesn't exist
  }
};
