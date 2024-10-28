import path from "node:path";
import type { WorkerPool } from "./WorkerPool";
import { app } from "electron";

/**
 * Processes a folder by running the workers using the WorkerPool.
 *
 * @param workerPool - The WorkerPool instance to manage worker threads.
 * @param filePath - The source folder path to be processed.
 * @param isDev - Is running in the development build (npm run dev).
 * @returns A Promise that resolves when the worker processes complete.
 */
export const processFolder = async (
	pool: WorkerPool,
	filePath: string,
	isDev = false,
): Promise<void> => {
	// Worker script path
	const workerScript = isDev
		? path.resolve(__dirname, "../es-workers/copyWorker.js")
		: path.join(app.getAppPath(), "../../resources/copyWorker.cjs");

	const destinationPath = isDev
		? path.resolve(__dirname, "../../resources/transfers/TR_0000_0000")
		: path.join(app.getAppPath(), "../../resources/transfers/TR_0000_0000");

	const workerData = {
		source: filePath,
		destination: destinationPath,
	};

	try {
		// Run the copyWorker task using the WorkerPool
		await pool.runTask(workerScript, workerData);
		console.log(`Successfully copied folder from ${filePath} to ${destinationPath}`);
	} catch (error) {
		console.error(`Failed to copy folder from ${filePath} to ${destinationPath}:`, error);
	}
};
