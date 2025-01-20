import path from "node:path";
import type { WorkerPool } from "../WorkerPool";
import { app } from "electron";

type WorkerData = {
  source: string;
  destination?: string;
  batchSize?: number;
};

type FileBufferObj = {
  filename: string;
  path: string;
  buffer: Buffer;
};

/**
 * Processes a folder by running the workers using the WorkerPool.
 *
 * @param workerPool - The WorkerPool instance to manage worker threads.
 * @param filePath - The source folder path to be processed.
 * @param isDev - Is running in the development build (npm run dev).
 * @param storeFile - If the file should be stored in the app data.
 * @param onProgress - Callback for progress updates.
 * @param onCompletion - Callback for final completion data.
 * @returns A Promise that resolves when the worker processes complete.
 */
export const getFolderBuffer = async (
  pool: WorkerPool,
  filePath: string,
  isDev: boolean,
  storeFile: boolean,
  onProgress?: (data: { progressPercentage: number; source: string }) => void,
  onMissingPath?: (data: { path: string }) => void,
  onCompletion?: (data: {
    success: boolean;
    buffers?: FileBufferObj[];
    error?: unknown;
  }) => void
): Promise<void> => {
  const workerScript = isDev
    ? path.resolve(__dirname, "../es-workers/copyWorker.js")
    : path.join(app.getAppPath(), "../../resources/copyWorker.cjs");

  const destinationPath = isDev
    ? path.resolve(__dirname, "../../resources/file-list")
    : path.join(app.getAppPath(), "../../resources/file-list");

  const workerData: WorkerData = {
    source: filePath,
  };

  if (storeFile) workerData.destination = destinationPath;

  try {
    pool.on("progress", (data) => {
      if (onProgress && data.task === "copy") onProgress(data);
    });

    pool.on("missingPath", (data) => {
      if (onMissingPath && data.task === "copy") onMissingPath(data);
    });

    pool.on("completion", (data) => {
      if (onCompletion && data.task === "copy") onCompletion(data);
    });

    await pool.runTask(workerScript, workerData);
  } catch (error) {
    console.error(`Failed to process folder ${filePath}:`, error);
    if (onCompletion) onCompletion({ success: false, error });
  }
};
