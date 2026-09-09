import { createReadStream, createWriteStream, promises as fsPromises, type Stats } from "node:fs";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { parentPort } from "node:worker_threads";
import { formatFileSize } from "./formatFileSize";
import type { WorkerMetricsTracker } from "./metrics";
import { saveCopyState, type CopyStateFile } from "./copyState";

const { stat, readdir, mkdir } = fsPromises;

const COPY_CHUNK_SIZE = 64 * 1024 * 1024; // 64 MiB

type FileBufferMeta = {
  filename: string;
  path: string;
  filePath: string;
  size: number;
};

const streamToDisk = (
  srcPath: string,
  destPath: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    const input = createReadStream(srcPath, { highWaterMark: COPY_CHUNK_SIZE });
    const output = createWriteStream(destPath);
    input.pipe(output);
    output.on("finish", resolve);
    output.on("error", reject);
    input.on("error", (err) => {
      output.destroy();
      reject(err);
    });
  });

export const generateBuffersInBatches = async (
  sourceDir: string,
  originalSource: string,
  totalFileCount: number,
  processedFileCount = 0,
  metrics?: WorkerMetricsTracker,
  stateFilePath?: string,
  existingState?: CopyStateFile | null
): Promise<{ files: FileBufferMeta[]; tempDir: string; processedFileCount: number }> => {
  // Use existing state to resume if available
  const processedFiles: Record<string, { filePath: string; size: number }> =
    existingState?.processedFiles ?? {};
  let resolvedTempDir = existingState?.tempDir ?? null;

  const tempDir = resolvedTempDir ?? path.join(os.tmpdir(), `dats-copy-${randomUUID()}`);
  resolvedTempDir = tempDir;
  await mkdir(tempDir, { recursive: true });

  console.log("Copying files to temp dir:", tempDir);
  const files: FileBufferMeta[] = [];

  const entries = await readdir(sourceDir);

  for (const entry of entries) {
    const filePath = path.join(sourceDir, entry);
    const fileStat: Stats = await stat(filePath);

    if (fileStat.isDirectory()) {
      const subResult = await generateBuffersInBatches(
        filePath,
        originalSource,
        totalFileCount,
        processedFileCount,
        metrics,
        stateFilePath,
        existingState
      );
      files.push(...subResult.files);
      processedFileCount = subResult.processedFileCount;
    } else {
      const relativePath = path.relative(originalSource, filePath);

      // Skip files that were already processed
      if (processedFiles[relativePath]) {
        const cached = processedFiles[relativePath];
        files.push({
          filename: entry,
          path: filePath.replace(originalSource, ""),
          filePath: cached.filePath,
          size: cached.size,
        });
        continue;
      }

      const destPath = path.join(tempDir, relativePath);
      const destDir = path.dirname(destPath);
      await mkdir(destDir, { recursive: true });
      console.log(
        `Copying file: ${relativePath} (${formatFileSize(fileStat.size)})`
      );
      await streamToDisk(filePath, destPath);
      files.push({
        filename: entry,
        path: filePath.replace(originalSource, ""),
        filePath: destPath,
        size: fileStat.size,
      });

      processedFileCount += 1;
      processedFiles[relativePath] = { filePath: destPath, size: fileStat.size };
      metrics?.checkpoint();

      // Save state periodically
      if (stateFilePath && processedFileCount % 10 === 0) {
        saveCopyState(stateFilePath, {
          sourcePath: sourceDir,
          originalSource,
          totalFileCount,
          processedCount: processedFileCount,
          processedFiles,
          tempDir: resolvedTempDir,
        }).catch((err) => console.warn("[CopyState] Failed to save state:", err));
      }

      const progressPercentage = Math.round(
        (processedFileCount / totalFileCount) * 100
      );

      console.log(
        `Copy progress [${processedFileCount}/${totalFileCount}]: ${progressPercentage}% - ${relativePath}`
      );
      parentPort?.postMessage({
        type: "progress",
        source: originalSource,
        fileProcessed: relativePath,
        progressPercentage,
        currentFileIndex: processedFileCount,
        totalFiles: totalFileCount,
      });
    }
  }

  // Save final state
  if (stateFilePath) {
    saveCopyState(stateFilePath, {
      sourcePath: sourceDir,
      originalSource,
      totalFileCount,
      processedCount: processedFileCount,
      processedFiles,
      tempDir: resolvedTempDir,
    }).catch((err) => console.warn("[CopyState] Failed to save final state:", err));
  }

  return { files, tempDir, processedFileCount };
};
