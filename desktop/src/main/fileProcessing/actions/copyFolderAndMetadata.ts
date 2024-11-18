import path from "node:path";
import type { WorkerPool } from "../WorkerPool";
import { app } from "electron";

/**
 * Processes a folder by running the workers using the WorkerPool.
 *
 * @param workerPool - The WorkerPool instance to manage worker threads.
 * @param filePath - The source folder path to be processed.
 * @param transfer - The transfer identifier string.
 * @param isDev - Is running in the development build (npm run dev).
 * @returns A Promise that resolves when the worker processes complete.
 */
export const copyFolderAndMetadata = async (
	pool: WorkerPool,
	filePath: string,
	transfer: string,
	isDev = false,
): Promise<void> => {
	// Worker script path
	const copyWorkerScript = isDev
		? path.resolve(__dirname, "../es-workers/copyWorker.js")
		: path.join(app.getAppPath(), "../../resources/copyWorker.cjs");

	const metadataWorkerScript = isDev
		? path.resolve(__dirname, "../es-workers/metadataWorker.js")
		: path.join(app.getAppPath(), "../../resources/metadataWorker.cjs");

	const destinationPath = isDev
		? path.resolve(__dirname, `../../resources/transfers/${transfer}`)
		: path.join(app.getAppPath(), `../../resources/transfers/${transfer}`);

	const copyWorkerData = {
		source: filePath,
		destination: path.join(destinationPath, "/content"),
	};

	const metadataWorkerData = {
		source: filePath,
		destination: path.join(destinationPath, "/metadata/files.json"),
	};

	try {
		// State to track progress of individual tasks
		const progressState: Record<string, number> = {
			copy: 0,
			metadata: 0,
		};

		pool.on("progress", (data) => {
			// Update the progress of the respective task
			progressState[data.task] = data.progress;

			// Calculate combined progress as the average of both tasks
			const combinedProgress = (progressState.copy + progressState.metadata) / 2;

			console.log(`Progress: ${combinedProgress.toFixed(1)}%`);
		});

		// Run the worker tasks using the WorkerPool
		const copyPromise = pool.runTask(copyWorkerScript, copyWorkerData);
		const metadataPromise = pool.runTask(metadataWorkerScript, metadataWorkerData);
		await Promise.all([copyPromise, metadataPromise]);

		console.log(`Successfully processed folder from ${filePath} to ${destinationPath}`);
	} catch (error) {
		console.error(`Failed to process folder ${filePath}:`, error);
	}
};
