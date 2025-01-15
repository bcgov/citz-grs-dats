import { parentPort, workerData } from "node:worker_threads";
import path from "node:path";
import {
  promises as fsPromises,
  type Stats,
  createReadStream,
  createWriteStream,
} from "node:fs";

const { stat, readdir, mkdir } = fsPromises;

type WorkerData = {
  source: string;
  destination?: string;
  batchSize?: number;
};

type FileBuffer = {
  filename: string;
  path: string;
  buffer: Buffer;
};

// Type guard to check if an error is of type ErrnoException
const isErrnoException = (err: unknown): err is NodeJS.ErrnoException =>
  err instanceof Error && "code" in err;

// Ensure a directory exists or create it
const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (isErrnoException(err) && err.code === "EEXIST") return; // Ignore error if directory already exists
    throw err; // Throw the error if it's not 'EEXIST'
  }
};

// Global counters for total file count and processed file count
let totalFileCount = 0;
let processedFileCount = 0;

// Recursively count all files in the directory structure
const countFiles = async (dir: string): Promise<number> => {
  let count = 0;
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStat: Stats = await stat(filePath);

    if (fileStat.isDirectory()) {
      count += await countFiles(filePath); // Count files in subdirectory
    } else {
      count += 1; // Count file
    }
  }

  return count;
};

// Copy a file using streams
const copyFileStream = (
  sourcePath: string,
  destinationPath: string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(destinationPath);

    readStream.on("error", reject);
    writeStream.on("error", reject);

    writeStream.on("finish", resolve);

    readStream.pipe(writeStream);
  });
};

// Create a buffer representation of the folder
const createFolderBuffer = async (dir: string): Promise<FileBuffer[]> => {
  const buffers: FileBuffer[] = [];

  const files = await readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    const fileStat: Stats = await stat(filePath);

    if (fileStat.isDirectory()) {
      const subBuffers = await createFolderBuffer(filePath);
      buffers.push(...subBuffers);
    } else {
      const fileBuffer = await fsPromises.readFile(filePath);
      buffers.push({
        filename: file.name,
        path: filePath,
        buffer: fileBuffer,
      });
    }
  }

  return buffers;
};

// Copy a directory in batches
const copyDirectoryInBatches = async (
  source: string,
  destination?: string,
  batchSize = 10
): Promise<FileBuffer[]> => {
  if (destination) {
    await ensureDirectoryExists(destination);
  }

  const files = await readdir(source);
  const folderBuffers: FileBuffer[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (file) => {
        const sourcePath = path.join(source, file);
        const destinationPath = destination
          ? path.join(destination, file)
          : undefined;
        const fileStat: Stats = await stat(sourcePath);

        if (fileStat.isDirectory()) {
          const subBuffers = await copyDirectoryInBatches(
            sourcePath,
            destinationPath,
            batchSize
          );
          folderBuffers.push(...subBuffers);
        } else {
          if (destinationPath) {
            await copyFileStream(sourcePath, destinationPath);
          }
          const fileBuffer = await fsPromises.readFile(sourcePath);
          folderBuffers.push({
            filename: file,
            path: sourcePath,
            buffer: fileBuffer,
          });

          processedFileCount += 1;

          // Calculate and send progress percentage
          const progressPercentage = Math.round(
            (processedFileCount / totalFileCount) * 100
          );
          parentPort?.postMessage({
            type: "progress",
            source,
            fileProcessed: sourcePath,
            progressPercentage,
          });
        }
      })
    );
  }

  return folderBuffers;
};

(async () => {
  if (!workerData) return;
  const { source, destination, batchSize } = workerData as WorkerData;

  try {
    const exists = await stat(source)
      .then((stats) => stats.isDirectory())
      .catch(() => false);

    if (!exists) {
      parentPort?.postMessage({ type: "missingPath", path: source });
      return;
    }

    totalFileCount = await countFiles(source);

    console.log(`Processing files from ${source}`);
    const buffers = await copyDirectoryInBatches(
      source,
      destination,
      batchSize
    );

    parentPort?.postMessage({
      type: "completion",
      source,
      success: true,
      buffers,
    });
  } catch (error) {
    parentPort?.postMessage({
      type: "completion",
      success: false,
      error: (error as Error).message,
    });
  }
})();
