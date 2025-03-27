import path from "node:path";
import type { WorkerPool } from "../WorkerPool";
import { app, BrowserWindow } from "electron";

type WorkerData = {
  source: string;
  batchSize?: number;
};

/**
 * Processes a folder by running the workers using the WorkerPool.
 *
 * @param workerPool - The WorkerPool instance to manage worker threads.
 * @param filePath - The source folder path to be processed.
 * @param isDev - Is running in the development build (npm run dev).
 * @returns A Promise that resolves when the worker processes complete.
 */
export const getFolderBuffer = async (
  pool: WorkerPool,
  filePath: string,
  isDev: boolean,
  onFailure: (error: unknown) => void
): Promise<string | null> => {
  const workerScript = isDev
    ? path.resolve(__dirname, "../es-workers/workers/copyWorker.js")
    : path.join(app.getAppPath(), "../../resources/workers/copyWorker.cjs");

  const workerData: WorkerData = {
    source: filePath,
  };

  const { workerId, promise } = pool.runTask(workerScript, workerData);

  try {
    pool.on("progress", (data) => {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("folder-buffer-progress", data);
      });
    });

    pool.on("missingPath", (data) => {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("folder-buffer-missing-path", data);
      });
    });

    pool.on("emptyFolder", (data) => {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("folder-buffer-empty-folder", data);
      });
    });

    pool.on("completion", (data) => {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("folder-buffer-completion", data);
      });
    });

    promise
      .then(() => {
        console.log(`Worker ${workerId} completed successfully.`);
      })
      .catch((error) => {
        console.error(`Worker ${workerId} failed:`, error);
      });

    return workerId;
  } catch (error) {
    console.error(`[Copy Action] Failed to process folder ${filePath}:`, error);
    onFailure(error);
    return null;
  }
};
