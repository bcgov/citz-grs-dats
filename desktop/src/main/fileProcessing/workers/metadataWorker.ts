import { parentPort, workerData } from "node:worker_threads";
import path from "node:path";
import { promises as fsPromises, createReadStream, type Stats } from "node:fs";
import crypto, { type BinaryLike } from "node:crypto";

const { stat, readdir, writeFile } = fsPromises;

type WorkerData = {
  source: string;
  destination?: string;
  batchSize?: number;
};

export const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  return `${(size / 1024 ** i).toFixed(2)} ${sizes[i]}`;
};

const doesDirectoryExist = async (dirPath: string): Promise<boolean> => {
  try {
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // Directory does not exist
      return false;
    }
    throw error; // Re-throw other errors
  }
};

// Creates directory if doesnt exist
const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fsPromises.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
  }
};

const calculateChecksum = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const input = createReadStream(filePath);

    input.on("data", (chunk) => hash.update(chunk as BinaryLike));
    input.on("end", () => resolve(hash.digest("hex")));
    input.on("error", reject);
  });
};

let totalFileCount = 0;
let processedFileCount = 0;

const countFiles = async (dir: string): Promise<number> => {
  let count = 0;
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat: Stats = await stat(filePath);

    if (fileStat.isDirectory()) {
      count += await countFiles(filePath);
    } else {
      count += 1;
    }
  }

  return count;
};

const generateMetadataInBatches = async (
  rootDir: string,
  originalSource: string,
  batchSize = 10
): Promise<{
  metadata: Record<string, unknown[]>;
  fileCount: number;
  totalSize: number;
}> => {
  // Ensure all metadata is stored under the original source
  const metadata: Record<string, unknown[]> = { [originalSource]: [] };
  let fileCount = 0;
  let totalSize = 0;

  const files = await readdir(rootDir);
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (file) => {
        console.log(
          `Processing file ${file} from ${originalSource} in metadataWorker.`
        );
        const filePath = path.join(rootDir, file);
        const fileStat: Stats = await stat(filePath);

        if (fileStat.isDirectory()) {
          const subMetadata = await generateMetadataInBatches(
            filePath,
            originalSource,
            batchSize
          );

          // Merge file metadata from subdirectories into the original source key
          metadata[originalSource].push(
            ...subMetadata.metadata[originalSource]
          );
          fileCount += subMetadata.fileCount;
          totalSize += subMetadata.totalSize;
        } else {
          const fileChecksum = await calculateChecksum(filePath);
          metadata[originalSource].push({
            filepath: filePath,
            filename: path.relative(originalSource, filePath),
            size: formatFileSize(fileStat.size),
            birthtime: new Date(fileStat.birthtime).toISOString(),
            lastModified: new Date(fileStat.mtime).toISOString(),
            lastAccessed: new Date(fileStat.atime).toISOString(),
            checksum: fileChecksum,
          });

          totalSize += fileStat.size;
          fileCount += 1;
          processedFileCount += 1;

          const progressPercentage = Math.round(
            (processedFileCount / totalFileCount) * 100
          );

          console.log(
            `Metadata progress of ${originalSource}: ${progressPercentage}`
          );

          parentPort?.postMessage({
            type: "progress",
            source: originalSource,
            fileProcessed: filePath,
            progressPercentage,
          });
        }
      })
    );
  }

  return { metadata, fileCount, totalSize };
};

const writeOrAppendMetadata = async (
  metadataFilePath: string,
  newMetadata: Record<string, unknown>
): Promise<void> => {
  let finalMetadata: Record<string, unknown>;

  try {
    const existingMetadataRaw = await fsPromises.readFile(
      metadataFilePath,
      "utf8"
    );
    const existingMetadata = JSON.parse(existingMetadataRaw) as Record<
      string,
      unknown
    >;

    finalMetadata = { ...existingMetadata, ...newMetadata };
  } catch {
    finalMetadata = newMetadata;
  }

  await writeFile(metadataFilePath, JSON.stringify(finalMetadata, null, 2));
};

(async () => {
  console.log("Starting metadata worker.");
  if (!workerData) return;
  const { source, batchSize, destination } = workerData as WorkerData;

  try {
    const exists = await doesDirectoryExist(source);
    if (!exists) {
      console.log(`Missing ${source} in metadata worker.`);
      parentPort?.postMessage({
        type: "missingPath",
        path: source,
      });
    }

    totalFileCount = await countFiles(source);

    const { metadata, fileCount, totalSize } = await generateMetadataInBatches(
      source,
      source,
      batchSize
    );

    if (destination) {
      await ensureDirectoryExists(path.dirname(destination));
      await writeOrAppendMetadata(destination, { ...metadata, totalSize });
    }

    if (!metadata) throw Error("Generated without metadata.");

    parentPort?.postMessage({
      type: "completion",
      success: true,
      source,
      metadata,
      fileCount,
      totalSize,
    });
  } catch (error) {
    parentPort?.postMessage({
      type: "completion",
      success: false,
      error: (error as Error).message,
    });
  }
})();
