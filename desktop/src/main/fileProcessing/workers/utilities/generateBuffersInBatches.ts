import { promises as fsPromises, type Stats } from "node:fs";
import path from "node:path";
import { parentPort } from "node:worker_threads";

const { stat, readdir } = fsPromises;

type FileBuffer = {
  filename: string;
  path: string;
  buffer: Buffer;
};

let processedFileCount = 0;

export const generateBuffersInBatches = async (
  sourceDir: string,
  originalSource: string,
  totalFileCount: number,
  batchSize = 10
): Promise<FileBuffer[]> => {
  console.log("Generating buffers in batches for", sourceDir);
  const folderBuffers: FileBuffer[] = [];

  const files = await readdir(sourceDir);
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (file) => {
        const filePath = path.join(sourceDir, file);
        const fileStat: Stats = await stat(filePath);

        if (fileStat.isDirectory()) {
          const subBuffers = await generateBuffersInBatches(
            filePath,
            originalSource,
            totalFileCount,
            batchSize
          );
          folderBuffers.push(...subBuffers);
        } else {
          const fileBuffer = await fsPromises.readFile(filePath);
          folderBuffers.push({
            filename: file,
            path: filePath.replace(originalSource, ""),
            buffer: fileBuffer,
          });

          processedFileCount += 1;

          // Calculate and send progress percentage
          const progressPercentage = Math.round(
            (processedFileCount / totalFileCount) * 100
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

  return folderBuffers;
};
