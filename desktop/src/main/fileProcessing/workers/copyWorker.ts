import "./utilities/workerLog";
import { parentPort, workerData } from "node:worker_threads";
import {
  countFiles,
  doesDirectoryExist,
  generateBuffersInBatches,
  isNetworkError,
  WorkerMetricsTracker,
} from "./utilities";
import type { CopyStateFile } from "./utilities/copyState";
import { loadCopyState } from "./utilities/copyState";

type WorkerData = {
  source: string;
  stateFilePath?: string;
};

(async () => {
  console.log("[Copy worker] Starting with data:", workerData);
  if (!workerData) return;
  const { source, stateFilePath } = workerData as WorkerData;

  const metrics = new WorkerMetricsTracker();
  let tempDir: string | undefined;

  try {
    const directoryExists = await doesDirectoryExist(source);
    if (!directoryExists) {
      console.log(`Missing ${source} in copy worker.`);
      parentPort?.postMessage({
        type: "missingPath",
        path: source,
      });
      return;
    }

    const totalFileCount = await countFiles(source);
    metrics.checkpoint();

    // Load existing state for resume
    let existingState: CopyStateFile | null = null;
    if (stateFilePath) {
      existingState = await loadCopyState(stateFilePath);
      if (existingState) {
        console.log(
          `[Copy worker] Resuming from state: ${existingState.processedCount}/${existingState.totalFileCount} files processed`
        );
      }
    }

    const { files, tempDir: td } = await generateBuffersInBatches(
      source,
      source,
      totalFileCount,
      0,
      metrics,
      stateFilePath,
      existingState
    );
    tempDir = td;

    if (!files || files.length === 0)
      throw new Error("Generated without buffers.");

    parentPort?.postMessage({
      type: "metrics",
      metrics: metrics.snapshot(),
    });
    parentPort?.postMessage({
      type: "completion",
      source,
      success: true,
      buffers: files,
      tempDir,
    });
  } catch (error) {
    if (tempDir) {
      const { rm } = await import("node:fs/promises");
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
    if (isNetworkError(error)) {
      console.warn(
        `[Copy worker] Network error, pausing: ${
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
