import { parentPort, workerData } from "node:worker_threads";
import path from "node:path";
import { promises as fsPromises, createReadStream, type Stats } from "node:fs";
import crypto, { type BinaryLike } from "node:crypto";

const { stat, readdir, writeFile } = fsPromises;

type WorkerData = {
	source: string;
	destination: string;
	batchSize?: number;
};

// Helper to format file size to human-readable format
export const formatFileSize = (size: number) => {
	if (size < 1024) return `${size} B`;
	const i = Math.floor(Math.log(size) / Math.log(1024));
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	return `${(size / 1024 ** i).toFixed(2)} ${sizes[i]}`;
};

// Ensure a directory exists or create it
const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
	try {
		await fsPromises.mkdir(dirPath, { recursive: true });
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
	}
};

// Calculate file checksum
const calculateChecksum = async (filePath: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash("sha256");
		const input = createReadStream(filePath);

		input.on("data", (chunk) => hash.update(chunk as BinaryLike));
		input.on("end", () => resolve(hash.digest("hex")));
		input.on("error", reject);
	});
};

// Global total file count and processed file count for progress tracking
let totalFileCount = 0;
let processedFileCount = 0;

// Function to count all files in the directory structure recursively
const countFiles = async (dir: string): Promise<number> => {
	let count = 0;
	const files = await readdir(dir);

	for (const file of files) {
		const filePath = path.join(dir, file);
		const fileStat: Stats = await stat(filePath);

		if (fileStat.isDirectory()) {
			// Recursively count files in subdirectory
			count += await countFiles(filePath);
		} else {
			count += 1; // Count file
		}
	}

	return count;
};

// Generate metadata in batches
const generateMetadataInBatches = async (
	rootDir: string,
	batchSize = 10,
): Promise<{ metadata: Record<string, unknown>; fileCount: number; totalSize: number }> => {
	const metadata: Record<string, unknown> = { [rootDir]: [] };
	let fileCount = 0;
	let totalSize = 0;

	const files = await readdir(rootDir);
	for (let i = 0; i < files.length; i += batchSize) {
		const batch = files.slice(i, i + batchSize);

		await Promise.all(
			batch.map(async (file) => {
				const filePath = path.join(rootDir, file);
				const fileStat: Stats = await stat(filePath);

				if (fileStat.isDirectory()) {
					const subMetadata = await generateMetadataInBatches(filePath, batchSize);

					// Merge subdirectory metadata under its own key
					Object.assign(metadata, subMetadata.metadata);
					fileCount += subMetadata.fileCount;
					totalSize += subMetadata.totalSize;
				} else {
					console.log(`[metadataWorker] Processing file: ${filePath}`);
					const fileChecksum = await calculateChecksum(filePath);
					(metadata[rootDir] as Record<string, unknown>[]).push({
						filepath: filePath,
						filename: path.relative(rootDir, filePath),
						size: formatFileSize(fileStat.size),
						birthtime: new Date(fileStat.birthtime).toISOString(),
						lastModified: new Date(fileStat.mtime).toISOString(),
						lastAccessed: new Date(fileStat.atime).toISOString(),
						checksum: fileChecksum,
					});

					totalSize += fileStat.size;
					fileCount += 1;
					processedFileCount += 1; // Increment the processed file count

					// Calculate progress percentage
					const progressPercentage = Math.round((processedFileCount / totalFileCount) * 100);

					// Send message to WorkerPool about progress with percentage
					parentPort?.postMessage({
						type: "progress",
						fileProcessed: filePath,
						progressPercentage: progressPercentage,
					});
				}
			}),
		);
	}

	return { metadata, fileCount, totalSize };
};

const fileExists = async (filePath: string): Promise<boolean> => {
	try {
		await fsPromises.access(filePath);
		return true;
	} catch {
		return false;
	}
};

// Write or append metadata to a file
const writeOrAppendMetadata = async (
	metadataFilePath: string,
	newMetadata: Record<string, unknown>,
): Promise<void> => {
	let finalMetadata: Record<string, unknown>;

	if (await fileExists(metadataFilePath)) {
		// If the file exists, read and merge metadata
		const existingMetadataRaw = await fsPromises.readFile(metadataFilePath, "utf8");
		const existingMetadata = JSON.parse(existingMetadataRaw) as Record<string, unknown>;

		// Merge the new metadata with the existing metadata
		finalMetadata = {
			...existingMetadata,
			...newMetadata,
		};
	} else {
		// If the file doesn't exist, use the new metadata
		finalMetadata = newMetadata;
	}

	// Write the combined metadata back to the file
	await writeFile(metadataFilePath, JSON.stringify(finalMetadata, null, 2));
};

/**
 * Metadata Worker
 *
 * This worker generates metadata for files and directories within a specified path.
 * It processes files in batches, calculates checksums, collects file properties,
 * and saves the results to a specified file.
 */
(async () => {
	if (!workerData) return;
	const { source, batchSize, destination } = workerData as WorkerData;

	try {
		totalFileCount = await countFiles(source);

		console.log(`Generating metadata for ${source}`);
		const { metadata, fileCount, totalSize } = await generateMetadataInBatches(source, batchSize);

		// Ensure the directory for metadata file exists
		await ensureDirectoryExists(path.dirname(destination));

		// Write or append the metadata to the file
		await writeOrAppendMetadata(destination, { ...metadata, totalSize });

		if (parentPort) {
			parentPort.postMessage({ success: true, metadata, fileCount, totalSize });
		} else {
			process.exit(0); // Graceful exit if no parent port
		}
	} catch (error) {
		console.error(`Error during metadata generation: ${(error as Error).message}`);
		if (parentPort) {
			parentPort.postMessage({ success: false, error: (error as Error).message });
		} else {
			process.exit(1); // Exit with error code if no parent port
		}
	}
})();
