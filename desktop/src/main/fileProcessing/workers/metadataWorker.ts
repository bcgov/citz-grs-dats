import { parentPort, workerData } from "node:worker_threads";
import {
  doesDirectoryExist,
  generateExtendedMetadata,
  generateMetadataInBatches,
} from './utilities';

type WorkerData = {
  source: string;
  batchSize?: number;
};

(async () => {
  console.log("[worker] Starting metadata worker.", workerData);
  if (!workerData) return;
  const { source, batchSize } = workerData as WorkerData;

  try {
    const directoryExists = await doesDirectoryExist(source);
    if (!directoryExists) {
      console.log(`Missing ${source} in metadata worker.`);
      parentPort?.postMessage({
        type: "missingPath",
        path: source,
      });
    }

    const { metadata, fileCount, totalSize } = await generateMetadataInBatches(
      source,
      source,
      batchSize
    );

    if (!metadata) throw Error("Generated without metadata.");

    const metadataWithExtended = await generateExtendedMetadata(metadata);

    parentPort?.postMessage({
      type: "completion",
      success: true,
      source,
      metadata: metadataWithExtended,
      fileCount,
      totalSize,
    });
  } catch (error) {
    parentPort?.postMessage({
      type: "completion",
      success: false,
      error: (error as Error).message,
    });
  }
})();
