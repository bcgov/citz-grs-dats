import "./utilities/workerLog";
import { parentPort, workerData } from "node:worker_threads";
import {
  type ProcessingConfig,
  DEFAULT_PROCESSING_CONFIG,
  NetworkError,
  isNetworkError,
  doesDirectoryExist,
  generateMetadataInBatches,
  WorkerMetricsTracker,
} from "./utilities";

type WorkerData = {
  source: string;
  extendedMetadataPowerShellScript: string;
  ownerPowerShellScript: string;
  stateFilePath?: string;
  config?: ProcessingConfig;
};

(async () => {
  console.log("[Metadata worker] Starting with data:", workerData);
  if (!workerData) return;
  const {
    source,
    extendedMetadataPowerShellScript,
    ownerPowerShellScript,
    stateFilePath,
    config = DEFAULT_PROCESSING_CONFIG,
  } = workerData as WorkerData;

  const metrics = new WorkerMetricsTracker();

  try {
    const directoryExists = await doesDirectoryExist(source);
    if (!directoryExists) {
      console.log(`Missing ${source} in metadata worker.`);
      parentPort?.postMessage({
        type: "missingPath",
        path: source,
      });
      return;
    }

    const { metadata, extendedMetadata, fileCount, totalSize } =
      await generateMetadataInBatches(
        source,
        source,
        extendedMetadataPowerShellScript,
        stateFilePath,
        ownerPowerShellScript,
        config,
        metrics
      );

    if (!metadata) throw Error("Generated without metadata.");

    parentPort?.postMessage({
      type: "metrics",
      metrics: metrics.snapshot(),
    });
    parentPort?.postMessage({
      type: "completion",
      success: true,
      source,
      metadata,
      extendedMetadata,
      fileCount,
      totalSize,
    });
  } catch (error) {
    if (error instanceof NetworkError || isNetworkError(error)) {
      console.warn(
        `[Metadata worker] Network error, pausing: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      metrics.pause();
      parentPort?.postMessage({
        type: "metrics",
        metrics: metrics.snapshot(),
      });
      parentPort?.postMessage({
        type: "networkPaused",
        source,
        error: error instanceof Error ? error.message : String(error),
        processedFileCount: 0,
        totalFileCount: 0,
      });
      return;
    }

    parentPort?.postMessage({
      type: "metrics",
      metrics: metrics.snapshot(),
    });
    parentPort?.postMessage({
      type: "completion",
      success: false,
      error: (error as Error).message,
    });
  }
})();
