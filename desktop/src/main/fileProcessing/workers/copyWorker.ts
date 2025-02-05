import { parentPort, workerData } from "node:worker_threads";
import {
  countFiles,
  doesDirectoryExist,
  generateBuffersInBatches,
} from "./utilities";

type WorkerData = {
  source: string;
  batchSize?: number;
};

(async () => {
  console.log("[Copy worker] Starting with data:", workerData);
  if (!workerData) return;
  const { source, batchSize } = workerData as WorkerData;

  try {
    const directoryExists = await doesDirectoryExist(source);
    if (!directoryExists) {
      console.log(`Missing ${source} in copy worker.`);
      parentPort?.postMessage({
        type: "missingPath",
        path: source,
      });
    }

    const totalFileCount = await countFiles(source);

    const buffers = await generateBuffersInBatches(
      source,
      source,
      totalFileCount,
      batchSize
    );

    if (!buffers || buffers.length === 0)
      throw new Error("Generated without buffers.");

    parentPort?.postMessage({
      type: "completion",
      source,
      success: true,
      buffers,
    });
  } catch (error) {
    parentPort?.postMessage({
      type: "completion",
      success: false,
      error: (error as Error).message,
    });
  }
})();
