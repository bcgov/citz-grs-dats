import path from "node:path";
import type { WorkerPool } from "../WorkerPool";
import { app } from "electron";

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
	isDev = false,
): Promise<void> => {
	// Worker script path
	const metadataWorkerScript = isDev
		? path.resolve(__dirname, "../es-workers/metadataWorker.js")
		: path.join(app.getAppPath(), "../../resources/metadataWorker.cjs");

	const destinationPath = isDev
		? path.resolve(__dirname, "../../resources/file-list")
		: path.join(app.getAppPath(), "../../resources/file-list");

	const metadataWorkerData = {
		source: filePath,
		destination: path.join(destinationPath, "/metadata.json"),
	};

	try {
		pool.on("progress", (data) => {
			console.log(`Progress: ${data.progress}%`);
		});

		// Run the worker tasks using the WorkerPool
		await pool.runTask(metadataWorkerScript, metadataWorkerData);

		console.log(`Successfully processed folder from ${filePath} to ${destinationPath}`);
	} catch (error) {
		console.error(`Failed to process folder ${filePath}:`, error);
	}
};
