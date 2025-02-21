import { parentPort, workerData } from "node:worker_threads";
import {
  countFiles,
  doesDirectoryExist,
  generateMetadataInBatches,
} from "./utilities";

type WorkerData = {
  source: string;
  extendedMetadataPowerShellScript: string;
  batchSize?: number;
};

(async () => {
  console.log("[Metadata worker] Starting with data:", workerData);
  if (!workerData) return;
  const { source, batchSize, extendedMetadataPowerShellScript } = workerData as WorkerData;

  try {
    const directoryExists = await doesDirectoryExist(source);
    if (!directoryExists) {
      console.log(`Missing ${source} in metadata worker.`);
      parentPort?.postMessage({
        type: "missingPath",
        path: source,
      });
    }

    const totalFileCount = await countFiles(source);

    const { metadata, extendedMetadata, fileCount, totalSize } = await generateMetadataInBatches(
      source,
      source,
      totalFileCount,
      extendedMetadataPowerShellScript,
      batchSize
    );

    if (!metadata) throw Error("Generated without metadata.");



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
    parentPort?.postMessage({
      type: "completion",
      success: false,
      error: (error as Error).message,
    });
  }
})();
