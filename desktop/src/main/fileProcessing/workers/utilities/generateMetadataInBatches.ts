import { promises as fsPromises, type Stats } from "node:fs";
import path from "node:path";
import { parentPort } from "node:worker_threads";
import { calculateChecksum } from "./calculateChecksum";
import { countFiles } from "./countFiles";
import { formatFileSize } from "./formatFileSize";

const { stat, readdir } = fsPromises;

let processedFileCount = 0;

export const generateMetadataInBatches = async (
  rootDir: string,
  originalSource: string,
  batchSize = 10
): Promise<{
  metadata: Record<string, unknown[]>;
  fileCount: number;
  totalSize: number;
}> => {
  console.log("Generating metadata in batches for", rootDir);
  const metadata: Record<string, unknown[]> = { [originalSource]: [] }; // Ensure all metadata is stored under the original source
  const totalFileCount = await countFiles(originalSource);
  console.log(`${totalFileCount} files counted in metadataWorker.`);
  let fileCount = 0;
  let totalSize = 0;

  const files = await readdir(rootDir);
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(
      `Processing ${rootDir} batch of ${batch.length} in metadataWorker.`
    );

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

          // Send progress update only if complete or progress is a multiple of 10%
          if (
            progressPercentage % 10 === 0 ||
            processedFileCount === totalFileCount
          ) {
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
        }
      })
    );
  }

  return { metadata, fileCount, totalSize };
};
