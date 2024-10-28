import os from "node:os";
import { WorkerPool } from "./WorkerPool";

/**
 * Creates a WorkerPool with the maximum number of workers set to the number of CPU cores.
 *
 * @returns An instance of WorkerPool configured to use the maximum number of CPU cores.
 */
export const createWorkerPool = (): WorkerPool => {
	// Determine the number of CPU cores
	const numCores = os.cpus().length;
	const maxWorkers = numCores;

	// Create and return the WorkerPool instance
	const pool = new WorkerPool(maxWorkers);
	console.log(`Worker pool created with ${numCores} CPU cores.`);
	return pool;
};
