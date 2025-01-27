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
  onEmptyFolder?: (data: { path: string }) => void,
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
      if (data.task === "copy" && onProgress) onProgress(data);
    });

    pool.on("missingPath", (data) => {
      if (data.task === "copy" && onMissingPath) onMissingPath(data);
    });

    pool.on("emptyFolder", (data) => {
      if (data.task === "copy" && onEmptyFolder) onEmptyFolder(data);
    });

    pool.on("completion", (data) => {
      if (data.task === "copy" && onCompletion) onCompletion(data);
    });

    await pool.runTask(workerScript, workerData);
  } catch (error) {
    console.error(`[Action] Failed to process folder ${filePath}:`, error);
    if (onCompletion) onCompletion({ success: false, error });
  }
};
