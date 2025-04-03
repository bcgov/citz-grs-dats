import path from "node:path";
import type { WorkerPool } from "../WorkerPool";
import { app, BrowserWindow } from "electron";

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
 * @returns A Promise that resolves when the worker processes complete.
 */
export const getFolderMetadata = async (
  pool: WorkerPool,
  filePath: string,
  isDev: boolean,
  onFailure: (error: unknown) => void
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
      if (data.workerId !== workerId) return;
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("folder-metadata-progress", data);
      });
    });

    pool.on("missingPath", (data) => {
      if (data.workerId !== workerId) return;
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("folder-metadata-missing-path", data);
      });
    });

    pool.on("emptyFolder", (data) => {
      if (data.workerId !== workerId) return;
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("folder-metadata-empty-folder", data);
      });
    });

    pool.on("completion", (data) => {
      if (data.workerId !== workerId) return;
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send("folder-metadata-completion", data);
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
    console.error(`[Action] Failed to process folder ${filePath}:`, error);
    onFailure(error);
    return null;
  }
};
