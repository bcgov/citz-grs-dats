import { promises as fsPromises, type Stats } from "node:fs";
import path from "node:path";
import { parentPort } from "node:worker_threads";
import { calculateChecksum } from "./calculateChecksum";
import { formatFileSize } from "./formatFileSize";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { getExtendedMetadata } from "./getExtendedMetadata";

const execPromise = promisify(exec);
const { stat, readdir } = fsPromises;

let processedFileCount = 0;

export const generateMetadataInBatches = async (
  sourceDir: string,
  originalSource: string,
  totalFileCount: number,
  batchSize = 10
): Promise<{
  metadata: Record<string, unknown[]>;
  extendedMetadata: Record<string, unknown[]>;
  fileCount: number;
  totalSize: number;
}> => {
  console.log("Generating metadata in batches for", sourceDir);
  const metadata: Record<string, unknown[]> = { [originalSource]: [] };
  const extendedMetadata: Record<string, unknown[]> = { [originalSource]: [] };
  let fileCount = 0;
  let totalSize = 0;

  const files = await readdir(sourceDir);
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (file) => {
        const filePath = path.join(sourceDir, file);
        const fileStat: Stats = await stat(filePath);

        if (fileStat.isDirectory()) {
          const subMetadata = await generateMetadataInBatches(
            filePath,
            originalSource,
            totalFileCount,
            batchSize
          );

          // Merge file metadata from subdirectories into the original source key
          metadata[originalSource].push(
            ...subMetadata.metadata[originalSource]
          );
          extendedMetadata[originalSource].push(
            ...subMetadata.extendedMetadata[originalSource]
          );
          fileCount += subMetadata.fileCount;
          totalSize += subMetadata.totalSize;
        } else {
          const fileChecksum = await calculateChecksum(filePath);

          // Fetch owner metadata (Windows-only)
          let owner = "";
          if (process.platform === "win32") {
            try {
              const ownerCommand = `powershell.exe -Command "(Get-ACL '${filePath}').Owner"`;
              const { stdout } = await execPromise(ownerCommand);
              owner = stdout.trim() ?? "Not Available";
            } catch (psError) {
              console.warn(
                `Failed to retrieve owner metadata for: ${filePath}`,
                psError
              );
            }
          }

          metadata[originalSource].push({
            filepath: filePath,
            filename: path.relative(originalSource, filePath),
            size: formatFileSize(fileStat.size),
            birthtime: new Date(fileStat.birthtime).toISOString(),
            lastModified: new Date(fileStat.mtime).toISOString(),
            lastAccessed: new Date(fileStat.atime).toISOString(),
            checksum: fileChecksum,
            owner,
          });

          try {
            const extendedMetadataResults = await getExtendedMetadata(filePath);
            extendedMetadata[originalSource].push(extendedMetadataResults);
          }
          catch (error) {
            console.warn(`<<<<<<Failed to retrieve extended metadata for: ${filePath}`, error);
          }

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

  return { metadata, extendedMetadata, fileCount, totalSize };
};
