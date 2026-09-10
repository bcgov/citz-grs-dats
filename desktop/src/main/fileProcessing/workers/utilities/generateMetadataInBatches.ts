import { promises as fsPromises, type Stats } from "node:fs";
import path from "node:path";
import { parentPort } from "node:worker_threads";
import { calculateChecksums } from "./calculateChecksum";
import { calculateFingerprints } from "./calculateFingerprint";
import { formatFileSize } from "./formatFileSize";
import { getExtendedMetadataBatch } from "./getExtendedMetadataBatch";
import { getOwnerBatch } from "./getOwnerBatch";
import {
  type MetadataStateFile,
  NetworkError,
  isNetworkError,
  loadMetadataState,
  saveMetadataState,
} from "./metadataState";
import { type WorkerMetricsTracker } from "./metrics";
import {
  DEFAULT_PROCESSING_CONFIG,
  type ProcessingConfig,
  ProgressReporter,
} from "./progressReporter";
import { runWithConcurrencyLimit } from "./runWithConcurrencyLimit";

const { stat, readdir } = fsPromises;

const wrapNetworkError = (error: unknown, context: string): Error => {
  if (error instanceof NetworkError) return error;
  if (isNetworkError(error)) {
    return new NetworkError(
      context,
      error instanceof Error ? error : undefined
    );
  }
  return error instanceof Error ? error : new Error(String(error));
};

const processFile = async (
  filePath: string,
  originalSource: string,
  config: ProcessingConfig
): Promise<{
  filePath: string;
  relativePath: string;
  fileStat: Stats;
  checksums: Record<string, string>;
}> => {
  const relativePath = path.relative(originalSource, filePath);
  let fileStat: Stats;
  try {
    fileStat = await stat(filePath);
  } catch (error) {
    throw wrapNetworkError(error, `Network error reading ${filePath}`);
  }

  let checksums: Record<string, string>;
  try {
    if (config.checksumMode === "fingerprint") {
      checksums = await calculateFingerprints(
        filePath,
        config.hashAlgorithms,
        fileStat.size,
        fileStat.mtime,
        config.fingerprintSize
      );
    } else {
      checksums = await calculateChecksums(
        filePath,
        config.hashAlgorithms,
        config.highWaterMark
      );
    }
  } catch (error) {
    throw wrapNetworkError(error, `Network error checksumming ${filePath}`);
  }

  return { filePath, relativePath, fileStat, checksums };
};

export const generateMetadataInBatches = async (
  sourceDir: string,
  originalSource: string,
  extendedMetadataPowerShellScript: string,
  stateFilePath?: string,
  ownerPowerShellScript?: string,
  config: ProcessingConfig = DEFAULT_PROCESSING_CONFIG,
  metrics?: WorkerMetricsTracker
): Promise<{
  metadata: Record<string, unknown[]>;
  extendedMetadata: Record<string, unknown[]>;
  fileCount: number;
  totalSize: number;
  processedFileCount: number;
}> => {
  console.log("Generating metadata for", sourceDir);
  const startTime = Date.now();
  parentPort?.postMessage({
    type: "status",
    source: originalSource,
    message: `Beginning processing for ${originalSource}`,
  });

  const allFiles: string[] = [];
  const walkDir = async (dir: string): Promise<void> => {
    const entries = await readdir(dir);
    for (const entry of entries) {
      const filePath = path.join(dir, entry);
      let fileStat: Stats;
      try {
        fileStat = await stat(filePath);
      } catch (error) {
        if (isNetworkError(error)) {
          throw new NetworkError(
            `Network error reading directory: ${dir}`,
            error instanceof Error ? error : undefined
          );
        }
        throw error;
      }
      if (fileStat.isDirectory()) {
        await walkDir(filePath);
      } else {
        allFiles.push(filePath);
      }
    }
  };
  await walkDir(sourceDir);
  metrics?.checkpoint();

  const totalFileCount = allFiles.length;
  console.log(`[Metadata] Found ${totalFileCount} files in ${sourceDir}`);

  let processedFiles: MetadataStateFile["processedFiles"] = {};
  let processedCount = 0;
  let totalSize = 0;

  if (stateFilePath) {
    const state = await loadMetadataState(stateFilePath);
    if (state) {
      processedFiles = state.processedFiles;
      processedCount = state.processedCount;
      totalSize = state.totalSize;
      console.log(
        `[Metadata] Resuming: ${processedCount}/${totalFileCount} files already processed`
      );
    }
  }
  metrics?.checkpoint();

  parentPort?.postMessage({
    type: "status",
    source: originalSource,
    message:
      processedCount > 0
        ? `Resuming metadata collection - ${processedCount}/${totalFileCount} files already processed`
        : `Starting to process ${totalFileCount} files in ${sourceDir}`,
  });

  if (totalFileCount === 0) {
    parentPort?.postMessage({
      type: "emptyFolder",
      path: sourceDir,
    });
  }

  const hasOwners = process.platform === "win32" && !!ownerPowerShellScript;
  const hasExtended = process.platform === "win32";

  const extendedTotalWeight = 33;
  const ownerWeight = hasOwners ? extendedTotalWeight / 2 : 0;
  const extendedWeight = hasExtended
    ? hasOwners
      ? extendedTotalWeight / 2
      : extendedTotalWeight
    : 0;

  const steps = [
    { weight: 67 },
    ...(ownerWeight > 0
      ? [{ weight: ownerWeight, label: "Checking owners..." }]
      : []),
    ...(extendedWeight > 0
      ? [{ weight: extendedWeight, label: "Getting extended metadata..." }]
      : []),
  ];
  const reporter = new ProgressReporter(originalSource, steps);
  reporter.setTotal(totalFileCount);

  reporter.setCompleted(processedCount);
  if (processedCount > 0) {
    reporter.sendCurrentProgress();
  }

  const saveState = () => {
    if (!stateFilePath) return;
    return saveMetadataState(stateFilePath, {
      sourcePath: sourceDir,
      originalSource,
      totalFileCount,
      processedCount,
      totalSize,
      processedFiles,
    });
  };

  const processedSet = new Set(Object.keys(processedFiles));
  const metadata: Record<string, unknown[]> = { [originalSource]: [] };
  const extendedMetadata: Record<string, unknown[]> = { [originalSource]: [] };

  for (const entry of Object.values(processedFiles)) {
    metadata[originalSource].push(entry.metadataEntry);
    if (entry.extendedMetadataEntry) {
      extendedMetadata[originalSource].push(entry.extendedMetadataEntry);
    }
  }

  const filesByDir = new Map<string, string[]>();
  for (const filePath of allFiles) {
    const relativePath = path.relative(originalSource, filePath);
    if (processedSet.has(relativePath)) continue;
    const dir = path.dirname(filePath);
    if (!filesByDir.has(dir)) filesByDir.set(dir, []);
    filesByDir.get(dir)!.push(filePath);
  }

  for (const [dir, dirFiles] of filesByDir) {
    const dirResults: {
      filePath: string;
      relativePath: string;
      fileStat: Stats;
      checksums: Record<string, string>;
    }[] = [];

    metrics?.startRegularStage();

    const processOneFile = async (filePath: string) => {
      const result = await processFile(filePath, originalSource, config);
      processedCount++;
      const metadataEntry = {
        filepath: result.filePath,
        filename: result.relativePath,
        size: formatFileSize(result.fileStat.size),
        birthtime: new Date(result.fileStat.birthtime).toISOString(),
        lastModified: new Date(result.fileStat.mtime).toISOString(),
        lastAccessed: new Date(result.fileStat.atime).toISOString(),
        checksum: result.checksums,
        owner: "Not Available",
      };
      metadata[originalSource].push(metadataEntry);
      processedFiles[result.relativePath] = { metadataEntry };
      totalSize += result.fileStat.size;
      reporter.fileProcessed(result.relativePath);
      console.log(
        `[Metadata] Processed [${processedCount}/${totalFileCount}] (${reporter.getPercentage()}%): ${result.relativePath}`
      );
      await saveState();
      metrics?.checkpointRegular();
      return result;
    };

    if (config.concurrency > 1) {
      const tasks = dirFiles.map((filePath) => () => processOneFile(filePath));
      try {
        const results = await runWithConcurrencyLimit(
          tasks,
          config.concurrency
        );
        dirResults.push(...results);
      } catch (error) {
        if (isNetworkError(error) && stateFilePath) {
          await saveMetadataState(stateFilePath, {
            sourcePath: sourceDir,
            originalSource,
            totalFileCount,
            processedCount,
            totalSize,
            processedFiles,
          });
        }
        throw wrapNetworkError(error, `Network error processing files in ${dir}`);
      }
    } else {
      for (const filePath of dirFiles) {
        try {
          const result = await processOneFile(filePath);
          dirResults.push(result);
        } catch (error) {
          if (isNetworkError(error) && stateFilePath) {
            await saveMetadataState(stateFilePath, {
              sourcePath: sourceDir,
              originalSource,
              totalFileCount,
              processedCount,
              totalSize,
              processedFiles,
            });
          }
          throw wrapNetworkError(
            error,
            `Network error processing ${filePath}`
          );
        }
      }
    }

    metrics?.stopRegularStage();

    let ownerStepIndex = hasOwners ? 1 : -1;
    if (ownerStepIndex >= 0) {
      reporter.phaseStarted(ownerStepIndex, "Checking owners...");
    }

    metrics?.startExtendedStage();

    let ownerMap = new Map<string, string>();
    if (hasOwners && dirFiles.length > 0) {
      try {
        ownerMap = await getOwnerBatch(
          dirFiles,
          ownerPowerShellScript!
        );
        console.log(
          `[Metadata] Owners fetched for ${dirFiles.length} file(s) in ${dir}`
        );
      } catch (error) {
        if (isNetworkError(error) && stateFilePath) {
          await saveMetadataState(stateFilePath, {
            sourcePath: sourceDir,
            originalSource,
            totalFileCount,
            processedCount,
            totalSize,
            processedFiles,
          });
          throw new NetworkError(
            `Network error getting owners in ${dir}`,
            error instanceof Error ? error : undefined
          );
        }
        console.warn("Failed to get owners for directory:", dir, error);
        for (const f of dirFiles) ownerMap.set(f, "Not Available");
      }
    }

    for (const { filePath, relativePath } of dirResults) {
      const owner = ownerMap.get(filePath) ?? "Not Available";
      if (processedFiles[relativePath]) {
        processedFiles[relativePath].metadataEntry.owner = owner;
      }
    }
    metrics?.checkpointExtended();
    if (ownerStepIndex >= 0) {
      reporter.phaseProgress(ownerStepIndex, 1, 1);
    }
    await saveState();

    let extendedStepIndex = hasExtended
      ? hasOwners ? 2 : 1
      : -1;
    if (extendedStepIndex >= 0) {
      reporter.phaseStarted(extendedStepIndex, "Getting extended metadata...");
    }

    if (hasExtended && dirFiles.length > 0) {
      try {
        const extendedBatchResult = await getExtendedMetadataBatch(
          dirFiles,
          extendedMetadataPowerShellScript
        );
        console.log(
          `[Metadata] Extended metadata fetched for ${dirFiles.length} file(s) in ${dir}`
        );

        for (const filePath of dirFiles) {
          const relativePath = path.relative(originalSource, filePath);
          const entry: Record<string, unknown> =
            (extendedBatchResult[filePath] as Record<string, unknown>) ?? {
              FilePath: filePath,
              error: "No metadata.",
            };
          extendedMetadata[originalSource].push(entry);
          if (processedFiles[relativePath]) {
            processedFiles[relativePath].extendedMetadataEntry = entry;
          }
        }
      } catch (error) {
        if (isNetworkError(error) && stateFilePath) {
          await saveMetadataState(stateFilePath, {
            sourcePath: sourceDir,
            originalSource,
            totalFileCount,
            processedCount,
            totalSize,
            processedFiles,
          });
          throw new NetworkError(
            `Network error getting extended metadata in ${dir}`,
            error instanceof Error ? error : undefined
          );
        }
        console.warn(
          "Failed to retrieve extended metadata for directory:",
          dir,
          error
        );
        for (const filePath of dirFiles) {
          extendedMetadata[originalSource].push({
            FilePath: filePath,
            error: "No metadata.",
          });
        }
      }
    }
    if (extendedStepIndex >= 0) {
      reporter.phaseProgress(extendedStepIndex, 1, 1);
    }
    metrics?.checkpointExtended();
    metrics?.stopExtendedStage();
    await saveState();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `[Metadata] Completed ${processedCount} files in ${elapsed}s for ${originalSource}`
  );

  return {
    metadata,
    extendedMetadata,
    fileCount: processedCount,
    totalSize,
    processedFileCount: processedCount,
  };
};
