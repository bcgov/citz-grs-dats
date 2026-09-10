import path from "node:path";
import type { WorkerPool } from "../WorkerPool";
import { app, BrowserWindow } from "electron";
import { FolderMetricsTracker } from "../metrics/folderMetrics";
import type { WorkerMetricsSnapshot } from "../workers/utilities/metrics";
import { writeWorkerLog } from "../../logFile";
import { getCopyStateFilePath } from "../workers/utilities/copyState";
import { checkIpRange } from "../workers/utilities/networkCheck";

type WorkerData = {
  source: string;
  stateFilePath?: string;
};

const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 30 * 60 * 1000;

const MAX_BUFFER_RETRIES = 3;
const RETRY_DELAY_MS = 2_000;

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

  const cacheDir = path.join(app.getPath("userData"), "dats-copy-cache");
  const stateFilePath = getCopyStateFilePath(filePath, cacheDir);

  const workerData: WorkerData = {
    source: filePath,
    stateFilePath,
  };

  const metrics = new FolderMetricsTracker({
    sourcePath: filePath,
    originalSource: filePath,
    operationType: "copy",
  });

  let currentWorkerId: string;
  let lastWorkerMetrics: WorkerMetricsSnapshot | null = null;
  let networkResumePoll: NodeJS.Timeout | undefined;
  let pollStartTime = 0;
  let retryCount = 0;
  let retryTimer: NodeJS.Timeout | undefined;

  const stopPolling = () => {
    if (networkResumePoll) {
      clearInterval(networkResumePoll);
      networkResumePoll = undefined;
    }
  };

  const stopRetrying = () => {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = undefined;
    }
  };

  const broadcastToWindows = (channel: string, data: unknown) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send(channel, data);
    });
  };

  const startNetworkResume = () => {
    stopPolling();
    pollStartTime = Date.now();
    console.log(
      `[Buffer Action] Network paused for ${filePath}, polling for recovery...`
    );
    networkResumePoll = setInterval(async () => {
      if (Date.now() - pollStartTime > POLL_TIMEOUT_MS) {
        stopPolling();
        console.warn(
          `[Buffer Action] Network resume polling timed out for ${filePath}`
        );
        metrics.recordDisconnectEnd();
        metrics.finalize("timedOut");
        metrics.persist().catch((err) =>
          console.error("[Metrics] Failed to persist metrics:", err)
        );
        broadcastToWindows("folder-buffer-completion", {
          success: false,
          source: filePath,
          error: "Network resume timed out after 30 minutes.",
        });
        cleanup();
        return;
      }

      if (!checkIpRange()) return;

      stopPolling();
      console.log(
        `[Buffer Action] Network recovered, resuming buffer processing for ${filePath}`
      );
      metrics.recordDisconnectEnd();
      metrics.persist().catch((err) =>
        console.error("[Metrics] Failed to persist metrics:", err)
      );
      broadcastToWindows("folder-buffer-resumed", {
        source: filePath,
      });

      const { workerId: newWorkerId } = pool.runTask(workerScript, workerData);
      currentWorkerId = newWorkerId;
      console.log(
        `[Buffer Action] Worker restarted with ID: ${newWorkerId}`
      );
    }, POLL_INTERVAL_MS);
  };

  const handleProgress = (data: { workerId: string }) => {
    if (data.workerId !== currentWorkerId) return;
    broadcastToWindows("folder-buffer-progress", data);
  };

  const handleMissingPath = (data: { workerId: string }) => {
    if (data.workerId !== currentWorkerId) return;
    broadcastToWindows("folder-buffer-missing-path", data);
  };

  const handleEmptyFolder = (data: { workerId: string }) => {
    if (data.workerId !== currentWorkerId) return;
    broadcastToWindows("folder-buffer-empty-folder", data);
  };

  const handleMetrics = (data: {
    workerId: string;
    metrics: WorkerMetricsSnapshot;
  }) => {
    if (data.workerId !== currentWorkerId) return;
    lastWorkerMetrics = data.metrics;
    metrics.accumulateWorkerMetrics(data.metrics);
    if (data.metrics.disconnectDetected) {
      metrics.recordDisconnectStart(
        data.metrics.lastSuccessfulWorkTime ?? Date.now()
      );
    }
  };

  const handleNetworkPaused = (data: { workerId: string }) => {
    if (data.workerId !== currentWorkerId) return;
    if (lastWorkerMetrics?.lastSuccessfulWorkTime != null) {
      metrics.recordDisconnectStart(lastWorkerMetrics.lastSuccessfulWorkTime);
    }
    broadcastToWindows("folder-buffer-paused", data);
    startNetworkResume();
  };

  const handleCompletion = (data: { workerId: string; success: boolean }) => {
    if (data.workerId !== currentWorkerId) return;
    stopPolling();
    metrics.recordDisconnectEnd();
    metrics.finalize(data.success ? "completed" : "failed");
    metrics.persist().catch((err) =>
      console.error("[Metrics] Failed to persist metrics:", err)
    );
    broadcastToWindows("folder-buffer-completion", data);
    cleanup();
  };

  const handleLog = (data: { workerId: string; level: string; message: string }) => {
    if (data.workerId !== currentWorkerId) return;
    console.log(data.message);
    writeWorkerLog(data.level, data.message);
  };

  const cleanup = () => {
    stopPolling();
    stopRetrying();
    pool.off("progress", handleProgress);
    pool.off("missingPath", handleMissingPath);
    pool.off("emptyFolder", handleEmptyFolder);
    pool.off("networkPaused", handleNetworkPaused);
    pool.off("completion", handleCompletion);
    pool.off("log", handleLog);
    pool.off("metrics", handleMetrics);
  };

  pool.on("progress", handleProgress);
  pool.on("missingPath", handleMissingPath);
  pool.on("emptyFolder", handleEmptyFolder);
  pool.on("networkPaused", handleNetworkPaused);
  pool.on("completion", handleCompletion);
  pool.on("log", handleLog);
  pool.on("metrics", handleMetrics);

  const startWorker = (): string => {
    const { workerId, promise } = pool.runTask(workerScript, workerData);
    currentWorkerId = workerId;

    promise
      .then(() => {
        console.log(`Worker ${workerId} completed successfully.`);
      })
      .catch((error) => {
        console.error(`Worker ${workerId} failed:`, error);
        stopPolling();
        if (retryCount < MAX_BUFFER_RETRIES) {
          retryCount++;
          console.log(
            `[Buffer Action] Retrying buffer processing for ${filePath} (attempt ${retryCount}/${MAX_BUFFER_RETRIES})`
          );
          broadcastToWindows("folder-buffer-status", {
            source: filePath,
            message: `Buffer processing failed \u2014 retrying (${retryCount}/${MAX_BUFFER_RETRIES})...`,
          });
          retryTimer = setTimeout(startWorker, RETRY_DELAY_MS * retryCount);
        } else {
          metrics.recordDisconnectEnd();
          metrics.finalize("failed");
          metrics.persist().catch((err) =>
            console.error("[Metrics] Failed to persist metrics:", err)
          );
          broadcastToWindows("folder-buffer-completion", {
            success: false,
            source: filePath,
            error: (error as Error)?.message ?? String(error),
          });
          cleanup();
        }
      });

    return workerId;
  };

  try {
    return startWorker();
  } catch (error) {
    console.error(`[Buffer Action] Failed to process folder ${filePath}:`, error);
    onFailure(error);
    return null;
  }
};
