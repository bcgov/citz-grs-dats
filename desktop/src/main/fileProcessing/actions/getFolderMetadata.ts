import path from "node:path";
import type { WorkerPool } from "../WorkerPool";
import { app } from "electron";

type WorkerData = {
  source: string;
  extendedMetadataPowerShellScript: string;
  batchSize?: number;
};

/**
 * Processes a folder by running the workers using the WorkerPool.
 *
 * @param workerPool - The WorkerPool instance to manage worker threads.
 * @param filePath - The source folder path to be processed.
 * @param isDev - Is running in the development build (npm run dev).
 * @param onProgress - Callback for progress updates.
 * @param onCompletion - Callback for final completion data.
 * @returns A Promise that resolves when the worker processes complete.
 */
export const getFolderMetadata = async (
  pool: WorkerPool,
  filePath: string,
  isDev: boolean,
  onProgress?: (data: { progressPercentage: number; source: string }) => void,
  onMissingPath?: (data: { path: string }) => void,
  onEmptyFolder?: (data: { path: string }) => void,
  onCompletion?: (data: {
    success: boolean;
    metadata?: Record<string, unknown>;
    extendedMetadata?: Record<string, unknown>;
    error?: unknown;
  }) => void
): Promise<string | null> => {
  console.log(`[Metadata Action] Processing folder ${filePath}`);
  const metadataWorkerScript = isDev
    ? path.resolve(__dirname, "../es-workers/workers/metadataWorker.js")
    : path.join(app.getAppPath(), "../../resources/workers/metadataWorker.cjs");

  const extendedMetadataPowerShellScript = isDev
    ? path.resolve(__dirname, "../es-workers/scripts/getExtendedMetadata.ps1")
    : path.join(
        app.getAppPath(),
        "../../resources/scripts/getExtendedMetadata.ps1"
      );

  const metadataWorkerData: WorkerData = {
    source: filePath,
    extendedMetadataPowerShellScript,
  };

  const { workerId, promise } = pool.runTask(
    metadataWorkerScript,
    metadataWorkerData
  );

  try {
    pool.on("progress", (data) => {
      console.log(`Progress ${data}`);
      if (data.task === "metadata" && onProgress) onProgress(data);
    });

    pool.on("missingPath", (data) => {
      if (data.task === "metadata" && onMissingPath) onMissingPath(data);
    });

    pool.on("emptyFolder", (data) => {
      if (data.task === "metadata" && onEmptyFolder) onEmptyFolder(data);
    });

    pool.on("completion", (data) => {
      if (data.task === "metadata" && onCompletion) onCompletion(data);
    });

    promise
      .then((result) => {
        console.log(`Worker ${workerId} completed successfully:`, result);
      })
      .catch((error) => {
        console.error(`Worker ${workerId} failed:`, error);
      });

    return workerId;
  } catch (error) {
    console.error(`[Action] Failed to process folder ${filePath}:`, error);
    if (onCompletion) onCompletion({ success: false, error });
    return null;
  }
};
