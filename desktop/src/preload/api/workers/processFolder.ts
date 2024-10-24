import path from "node:path";
import type { WorkerPool } from "./WorkerPool";

/**
 * Processes a folder by running the workers using the WorkerPool.
 *
 * @param workerPool - The WorkerPool instance to manage worker threads.
 * @param filePath - The source folder path to be processed.
 * @param destination - The destination folder path for the copied files.
 * @returns A Promise that resolves when the worker processes complete.
 */
export const processFolder = async (
	workerPool: WorkerPool,
	filePath: string,
	destination: string,
): Promise<void> => {
	// Worker script path
	const workerScript = path.resolve(__dirname, "copyWorker.js");

	const workerData = {
		payload: {
			source: filePath,
			destination,
		},
	};

	try {
		// Run the copyWorker task using the WorkerPool
		await workerPool.runTask(workerScript, workerData);
		console.log(`Successfully copied folder from ${filePath} to ${destination}`);
	} catch (error) {
		console.error(`Failed to copy folder from ${filePath} to ${destination}:`, error);
	}
};
