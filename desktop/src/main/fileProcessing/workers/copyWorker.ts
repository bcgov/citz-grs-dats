import { parentPort, workerData } from "node:worker_threads";
import path from "node:path";
import { promises as fsPromises, type Stats, createReadStream, createWriteStream } from "node:fs";

const { stat, readdir, mkdir } = fsPromises;

type WorkerData = {
	source: string;
	destination: string;
	batchSize?: number;
};

// Type guard to check if an error is of type ErrnoException
const isErrnoException = (err: unknown): err is NodeJS.ErrnoException =>
	err instanceof Error && "code" in err;

// Ensure a directory exists or create it
const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
	try {
		await mkdir(dirPath, { recursive: true });
	} catch (err) {
		if (isErrnoException(err) && err.code === "EEXIST") return; // Ignore error if directory already exists
		throw err; // Throw the error if it's not 'EEXIST'
	}
};

// Global counters for total file count and processed file count
let totalFileCount = 0;
let processedFileCount = 0;

// Recursively count all files in the directory structure
const countFiles = async (dir: string): Promise<number> => {
	let count = 0;
	const files = await readdir(dir);

	for (const file of files) {
		const filePath = path.join(dir, file);
		const fileStat: Stats = await stat(filePath);

		if (fileStat.isDirectory()) {
			count += await countFiles(filePath); // Count files in subdirectory
		} else {
			count += 1; // Count file
		}
	}

	return count;
};

// Copy a file using streams
const copyFileStream = (sourcePath: string, destinationPath: string): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		const readStream = createReadStream(sourcePath);
		const writeStream = createWriteStream(destinationPath);

		readStream.on("error", (err) => {
			console.error(`Read error on ${sourcePath}:`, err);
			reject(err);
		});

		writeStream.on("error", (err) => {
			console.error(`Write error on ${destinationPath}:`, err);
			reject(err);
		});

		writeStream.on("finish", resolve);

		readStream.pipe(writeStream);
	});
};

// Implement a delay to throttle I/O operations
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// A simple semaphore to control concurrency
class Semaphore {
	private counter: number;
	private waitingQueue: Array<() => void> = [];

	constructor(maxConcurrency: number) {
		this.counter = maxConcurrency;
	}

	async acquire(): Promise<void> {
		if (this.counter > 0) {
			this.counter--;
			return Promise.resolve();
		}

		return new Promise((resolve) => {
			this.waitingQueue.push(resolve);
		});
	}

	release(): void {
		if (this.waitingQueue.length > 0) {
			const next = this.waitingQueue.shift();
			if (next) next();
		} else {
			this.counter++;
		}
	}
}

// Copy a directory in batches with concurrency limits and throttling
const copyDirectoryInBatches = async (
	source: string,
	destination: string,
	batchSize = 10,
	concurrencyLimit = 5,
): Promise<void> => {
	await ensureDirectoryExists(destination);
	const files = await readdir(source);
	const semaphore = new Semaphore(concurrencyLimit); // Create a semaphore for concurrency control

	for (let i = 0; i < files.length; i += batchSize) {
		const batch = files.slice(i, i + batchSize);

		// Process the batch with concurrency control
		await Promise.all(
			batch.map(async (file) => {
				await semaphore.acquire(); // Acquire semaphore before processing

				try {
					const sourcePath = path.join(source, file);
					const destinationPath = path.join(destination, file);
					const fileStat: Stats = await stat(sourcePath);

					if (fileStat.isDirectory()) {
						await copyDirectoryInBatches(sourcePath, destinationPath, batchSize, concurrencyLimit);
					} else {
						console.log(`[copyWorker] Processing file: ${sourcePath}`);
						await copyFileStream(sourcePath, destinationPath);
						processedFileCount += 1;

						// Calculate and send progress percentage
						const progressPercentage = Math.round((processedFileCount / totalFileCount) * 100);
						parentPort?.postMessage({
							type: "progress",
							fileProcessed: sourcePath,
							progressPercentage: progressPercentage,
						});
					}
				} catch (err) {
					console.error(`[copyWorker] Error processing file: ${file}`, err);
					throw err; // Propagate the error to ensure the Promise fails
				} finally {
					semaphore.release(); // Release semaphore after processing
				}
			}),
		);

		// Add a delay between batches to throttle I/O
		await delay(100);
	}
};

/**
 * Copy Worker
 *
 * This worker performs efficient, concurrent copying of directories and files
 * from a specified source path to a destination path. It handles file I/O operations
 * in batches, supports error handling, and implements concurrency control.
 *
 * Definitions:
 * - **concurrencyLimit:** The maximum number of concurrent file operations allowed at any given time.
 * - **streams:** Read and write streams are used for file I/O, enabling efficient copying of files, especially large ones.
 * - **batchSize:** The number of files processed in a single batch. Adjusting this parameter allows tuning of performance.
 */

(async () => {
	if (!workerData) return;
	const { source, destination, batchSize } = workerData as WorkerData;
	const folderName = path.basename(source);

	try {
		totalFileCount = await countFiles(source);

		console.log(`Copying from ${source}`);
		await copyDirectoryInBatches(source, path.join(destination, folderName), batchSize);

		if (parentPort) {
			parentPort.postMessage({ success: true });
		} else {
			process.exit(0); // Graceful exit if no parent port
		}
	} catch (error) {
		console.error(`Error during copying: ${(error as Error).message}`);
		if (parentPort) {
			parentPort.postMessage({ success: false, error: (error as Error).message });
		} else {
			process.exit(1); // Exit with error code if no parent port
		}
	}
})();
