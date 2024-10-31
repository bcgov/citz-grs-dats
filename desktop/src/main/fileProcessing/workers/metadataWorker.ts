import { parentPort, workerData } from "node:worker_threads";
import path from "node:path";
import { promises as fsPromises, createReadStream, type Stats } from "node:fs";
import crypto, { type BinaryLike } from "node:crypto";
import { promisify } from "node:util";
import { exec } from "node:child_process";

const { stat, readdir, writeFile } = fsPromises;
const execPromise = promisify(exec);

type WorkerData = {
	source: string;
	destination: string;
	batchSize?: number;
};

// Function to get file owner based on platform
export const getFileOwner = async (filePath: string) => {
	try {
		let command: string;

		if (process.platform === "win32") {
			// Windows PowerShell command to get file owner
			command = `powershell -Command "(Get-Acl '${filePath}').Owner"`;
		} else {
			// Linux/macOS command to get file owner
			command = `stat -c '%U' '${filePath}'`;
		}

		const { stdout } = await execPromise(command);
		return stdout.trim(); // Return the owner name
	} catch (error) {
		console.error(`Error getting owner for file ${filePath}:`, error);
		return null; // Return null if owner could not be retrieved
	}
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

// Generate metadata in batches
const generateMetadataInBatches = async (
	rootDir: string,
	batchSize = 10,
): Promise<{ metadata: Record<string, unknown>; fileCount: number; totalSize: number }> => {
	const metadata = { files: [] as Record<string, unknown>[] };
	let fileCount = 0;
	let totalSize = 0;

	const files = await readdir(rootDir);
	for (let i = 0; i < files.length; i += batchSize) {
		const batch = files.slice(i, i + batchSize);

		await Promise.all(
			batch.map(async (file) => {
				const filePath = path.join(rootDir, file);
				const fileStat: Stats = await stat(filePath);
				const fileOwner = await getFileOwner(filePath);

				if (fileStat.isDirectory()) {
					const subMetadata = await generateMetadataInBatches(filePath, batchSize);
					metadata.files.push(...(subMetadata.metadata.files as Record<string, unknown>[]));
					fileCount += subMetadata.fileCount;
					totalSize += subMetadata.totalSize;
				} else {
					console.log(`[metadataWorker] Processing file: ${filePath}`);
					const fileChecksum = await calculateChecksum(filePath);
					metadata.files.push({
						filepath: path.join(rootDir, filePath),
						filename: path.relative(rootDir, filePath),
						size: formatFileSize(fileStat.size),
						birthtime: new Date(fileStat.birthtime).toISOString(),
						lastModified: new Date(fileStat.mtime).toISOString(),
						lastAccessed: new Date(fileStat.atime).toISOString(),
						owner: fileOwner,
						checksum: fileChecksum,
					});
					totalSize += fileStat.size;
					fileCount += 1;
				}
			}),
		);
	}

	return { metadata, fileCount, totalSize };
};

// Write metadata to a file
const writeMetadataToFile = async (
	metadataFilePath: string,
	metadata: Record<string, unknown>,
): Promise<void> => {
	await writeFile(metadataFilePath, JSON.stringify(metadata, null, 2));
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
		console.log(`Generating metadata for ${source}`);
		const { metadata, fileCount, totalSize } = await generateMetadataInBatches(source, batchSize);

		// Ensure the directory for metadata file exists
		await ensureDirectoryExists(path.dirname(destination));

		// Write metadata to the file
		await writeMetadataToFile(destination, { ...metadata, totalSize });

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
