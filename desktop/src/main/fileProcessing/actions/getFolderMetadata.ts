import path from "node:path";
import type { WorkerPool } from "../WorkerPool";
import { app, BrowserWindow } from "electron";
import { FolderMetricsTracker } from "../metrics/folderMetrics";
import type { WorkerMetricsSnapshot } from "../workers/utilities/metrics";
import {
  type ProcessingConfig,
  DEFAULT_PROCESSING_CONFIG,
  getStateFilePath,
} from "../workers/utilities";
import { writeWorkerLog } from "../../logFile";
import { checkIpRange } from "../workers/utilities/networkCheck";

type WorkerData = {
  source: string;
  extendedMetadataPowerShellScript: string;
  ownerPowerShellScript: string;
  stateFilePath?: string;
  config?: ProcessingConfig;
};

let processingConfig: ProcessingConfig = { ...DEFAULT_PROCESSING_CONFIG };

export const getProcessingConfig = (): ProcessingConfig => processingConfig;

export const setProcessingConfig = (config: Partial<ProcessingConfig>): void => {
  processingConfig = { ...processingConfig, ...config };
  console.log("[Metadata Action] Processing config updated:", processingConfig);
};

const METADATA_CACHE_DIR = path.join(
  app.getPath("userData"),
  "dats-metadata-cache"
);

const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 30 * 60 * 1000;

const MAX_METADATA_RETRIES = 3;
const RETRY_DELAY_MS = 2_000;

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

  const ownerPowerShellScript = isDev
    ? path.resolve(__dirname, "../es-workers/scripts/getOwnerBatch.ps1")
    : path.join(
        app.getAppPath(),
        "../../resources/scripts/getOwnerBatch.ps1"
      );

  const stateFilePath = getStateFilePath(filePath, METADATA_CACHE_DIR);

  const metadataWorkerData: WorkerData = {
    source: filePath,
    extendedMetadataPowerShellScript,
    ownerPowerShellScript,
    stateFilePath,
    config: processingConfig,
  };

  const metrics = new FolderMetricsTracker({
    sourcePath: filePath,
    originalSource: filePath,
    operationType: "metadata",
  });
  let lastWorkerMetrics: WorkerMetricsSnapshot | null = null;

  let currentWorkerId: string;
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
      `[Metadata Action] Network paused for ${filePath}, polling for recovery...`
    );
    networkResumePoll = setInterval(async () => {
      if (Date.now() - pollStartTime > POLL_TIMEOUT_MS) {
        stopPolling();
        console.warn(
          `[Metadata Action] Network resume polling timed out for ${filePath}`
        );
        metrics.recordDisconnectEnd();
        metrics.finalize("timedOut");
        metrics.persist().catch((err) =>
          console.error("[Metrics] Failed to persist metrics:", err)
        );
        broadcastToWindows("folder-metadata-completion", {
          success: false,
          source: filePath,
          error: "Network resume timed out after 30 minutes.",
        });
        return;
      }

      if (!checkIpRange()) return;

      stopPolling();
      console.log(
        `[Metadata Action] Network recovered, resuming metadata for ${filePath}`
      );
      metrics.recordDisconnectEnd();
      metrics.persist().catch((err) =>
        console.error("[Metrics] Failed to persist metrics:", err)
      );
      broadcastToWindows("folder-metadata-resumed", {
        source: filePath,
      });

      const { workerId: newWorkerId } = pool.runTask(
        metadataWorkerScript,
        metadataWorkerData
      );
      currentWorkerId = newWorkerId;
      console.log(
        `[Metadata Action] Worker restarted with ID: ${newWorkerId}`
      );
    }, POLL_INTERVAL_MS);
  };

  const handleProgress = (data: { workerId: string }) => {
    if (data.workerId !== currentWorkerId) return;
    broadcastToWindows("folder-metadata-progress", data);
  };

  const handleMissingPath = (data: { workerId: string }) => {
    if (data.workerId !== currentWorkerId) return;
    metrics.finalize("failed");
    metrics.persist().catch((err) =>
      console.error("[Metrics] Failed to persist metrics:", err)
    );
    broadcastToWindows("folder-metadata-missing-path", data);
  };

  const handleEmptyFolder = (data: { workerId: string }) => {
    if (data.workerId !== currentWorkerId) return;
    broadcastToWindows("folder-metadata-empty-folder", data);
  };

  const handleStatus = (data: { workerId: string }) => {
    if (data.workerId !== currentWorkerId) return;
    broadcastToWindows("folder-metadata-status", data);
  };

  const handleNetworkPaused = (data: { workerId: string }) => {
    if (data.workerId !== currentWorkerId) return;
    if (lastWorkerMetrics?.lastSuccessfulWorkTime != null) {
      metrics.recordDisconnectStart(lastWorkerMetrics.lastSuccessfulWorkTime);
    }
    broadcastToWindows("folder-metadata-paused", data);
    startNetworkResume();
  };

  const handleMetrics = (data: {
    workerId: string;
    metrics: WorkerMetricsSnapshot;
  }) => {
    if (data.workerId !== currentWorkerId) return;
    lastWorkerMetrics = data.metrics;
    metrics.accumulateWorkerMetrics(data.metrics);
  };

  const handleCompletion = (data: { workerId: string; success: boolean }) => {
    if (data.workerId !== currentWorkerId) return;
    stopPolling();
    metrics.finalize(data.success ? "completed" : "failed");
    metrics.persist().catch((err) =>
      console.error("[Metrics] Failed to persist metrics:", err)
    );
    broadcastToWindows("folder-metadata-completion", data);
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
    pool.off("status", handleStatus);
    pool.off("networkPaused", handleNetworkPaused);
    pool.off("completion", handleCompletion);
    pool.off("log", handleLog);
    pool.off("metrics", handleMetrics);
  };

  pool.on("progress", handleProgress);
  pool.on("missingPath", handleMissingPath);
  pool.on("emptyFolder", handleEmptyFolder);
  pool.on("status", handleStatus);
  pool.on("networkPaused", handleNetworkPaused);
  pool.on("completion", handleCompletion);
  pool.on("log", handleLog);
  pool.on("metrics", handleMetrics);

  const startWorker = (): string => {
    const { workerId, promise } = pool.runTask(
      metadataWorkerScript,
      metadataWorkerData
    );
    currentWorkerId = workerId;

    promise
      .then(() => {
        console.log(`Worker ${workerId} completed successfully.`);
      })
      .catch((error) => {
        console.error(`Worker ${workerId} failed:`, error);
        stopPolling();
        if (retryCount < MAX_METADATA_RETRIES) {
          retryCount++;
          console.log(
            `[Metadata Action] Retrying metadata processing for ${filePath} (attempt ${retryCount}/${MAX_METADATA_RETRIES})`
          );
          broadcastToWindows("folder-metadata-status", {
            source: filePath,
            message: `Metadata processing failed \u2014 retrying (${retryCount}/${MAX_METADATA_RETRIES})...`,
          });
          retryTimer = setTimeout(startWorker, RETRY_DELAY_MS * retryCount);
        } else {
          metrics.finalize("failed");
          metrics.persist().catch((err) =>
            console.error("[Metrics] Failed to persist metrics:", err)
          );
          broadcastToWindows("folder-metadata-completion", {
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
    console.error(`[Action] Failed to process folder ${filePath}:`, error);
    onFailure(error);
    return null;
  }
};
