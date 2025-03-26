import { promises as fsPromises, type Stats } from "node:fs";
import path from "node:path";
import { parentPort } from "node:worker_threads";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { calculateChecksum } from "./calculateChecksum";
import { formatFileSize } from "./formatFileSize";
import { runWithConcurrencyLimit } from "./runWithConcurrencyLimit";
import { getExtendedMetadataBatch } from "./getExtendedMetadataBatch";

const execPromise = promisify(exec);
const { stat, readdir } = fsPromises;

let processedFileCount = 0;

export const generateMetadataInBatches = async (
  sourceDir: string,
  originalSource: string,
  totalFileCount: number,
  extendedMetadataPowerShellScript: string,
  batchSize = 100
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
  const allBatches: string[][] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files
      .slice(i, i + batchSize)
      .map((file) => path.join(sourceDir, file));
    allBatches.push(batch);
  }

  await runWithConcurrencyLimit(
    allBatches.map((batch) => async () => {
      const batchMetadata: unknown[] = [];
      const batchFilePaths: string[] = [];

      for (const filePath of batch) {
        const fileStat: Stats = await stat(filePath);
        if (fileStat.isDirectory()) {
          const subMetadata = await generateMetadataInBatches(
            filePath,
            originalSource,
            totalFileCount,
            extendedMetadataPowerShellScript,
            batchSize
          );

          metadata[originalSource].push(
            ...subMetadata.metadata[originalSource]
          );
          extendedMetadata[originalSource].push(
            ...subMetadata.extendedMetadata[originalSource]
          );
          fileCount += subMetadata.fileCount;
          totalSize += subMetadata.totalSize;
        } else {
          const checksum = await calculateChecksum(filePath);

          let owner = "";
          if (process.platform === "win32") {
            try {
              const ownerCommand = `powershell.exe -Command "(Get-ACL '${filePath}').Owner"`;
              const { stdout } = await execPromise(ownerCommand);
              owner = stdout.trim() ?? "Not Available";
            } catch {
              owner = "Not Available";
            }
          }

          batchMetadata.push({
            filepath: filePath,
            filename: path.relative(originalSource, filePath),
            size: formatFileSize(fileStat.size),
            birthtime: new Date(fileStat.birthtime).toISOString(),
            lastModified: new Date(fileStat.mtime).toISOString(),
            lastAccessed: new Date(fileStat.atime).toISOString(),
            checksum,
            owner,
          });

          totalSize += fileStat.size;
          fileCount++;
          processedFileCount++;
          batchFilePaths.push(filePath);
        }
      }

      let extendedBatchResult: Record<string, unknown> = {};
      if (process.platform === "win32" && batchFilePaths.length > 0) {
        try {
          extendedBatchResult = await getExtendedMetadataBatch(
            batchFilePaths,
            extendedMetadataPowerShellScript
          );
        } catch (error) {
          console.warn(
            "Failed to retrieve extended metadata for batch:",
            error
          );
        }
      }

      metadata[originalSource].push(...batchMetadata);
      batchFilePaths.forEach((filePath) => {
        extendedMetadata[originalSource].push(
          extendedBatchResult[filePath] ?? {
            FilePath: filePath,
            error: "No metadata.",
          }
        );
      });

      const progressPercentage = Math.round(
        (processedFileCount / totalFileCount) * 100
      );
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
          fileProcessed: `${batchFilePaths.length} files`,
          progressPercentage,
        });
      }
    }),
    3 // concurrency limit
  );

  return { metadata, extendedMetadata, fileCount, totalSize };
};
