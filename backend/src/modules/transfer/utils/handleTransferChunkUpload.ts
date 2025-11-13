import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { once } from "node:events";
import {
	HTTP_STATUS_CODES,
	HttpError,
} from "@bcgov/citz-imb-express-utilities";
import { logs } from "@/utils";
import type { Readable } from "node:stream";

const UPLOAD_BASE_DIR = path.join(__dirname, "..", "uploads");

const {
	TRANSFER: {
		CHUNKING: { CHUNK_RECEIVED, CHUNKS_MERGED, ALL_CHUNKS_RECEIVED },
	},
} = logs;

type HandleTransferChunkUploadArgs = {
	accession: string;
	application: string;
	chunkIndex: number;
	totalChunks: number;
	receivedChecksum: string;
	chunkBuffer: Buffer;
};

export const handleTransferChunkUpload = async ({
	accession,
	application,
	chunkIndex,
	totalChunks,
	receivedChecksum,
	chunkBuffer,
}: HandleTransferChunkUploadArgs): Promise<Readable | null> => {
	if (
		Number.isNaN(chunkIndex) ||
		Number.isNaN(totalChunks) ||
		!receivedChecksum
	) {
		throw new HttpError(
			HTTP_STATUS_CODES.BAD_REQUEST,
			"Invalid chunk metadata.",
		);
	}

	const transferDir = path.join(
		UPLOAD_BASE_DIR,
		`TR_${accession}_${application}`,
	);

	await fs.promises.mkdir(transferDir, { recursive: true });

	const chunkPath = path.join(transferDir, `chunk_${chunkIndex}.bin`);
	await fs.promises.writeFile(chunkPath, chunkBuffer);

	console.log(
		CHUNK_RECEIVED(accession, application, chunkIndex, totalChunks),
	);

	const filesInDir = await fs.promises.readdir(transferDir);
	const receivedChunks = filesInDir.filter((f) =>
		f.startsWith("chunk_"),
	).length;

	// Not all chunks have been received yet
	if (receivedChunks < totalChunks) {
		return null;
	}

	console.log(ALL_CHUNKS_RECEIVED(accession, application));

	const mergedPath = path.join(transferDir, "merged.zip");
	const mergedWriteStream = fs.createWriteStream(mergedPath);
	const hash = crypto.createHash("sha256");

	try {
		// Stream chunks in order into mergedWriteStream and update hash
		for (let i = 0; i < totalChunks; i += 1) {
			const currentChunkPath = path.join(
				transferDir,
				`chunk_${i}.bin`,
			);

			// Extra guard in case a chunk is missing
			const exists = await fs.promises
				.stat(currentChunkPath)
				.then(() => true)
				.catch(() => false);

			if (!exists) {
				throw new HttpError(
					HTTP_STATUS_CODES.BAD_REQUEST,
					`Missing chunk file at index ${i}.`,
				);
			}

			const chunkReadStream = fs.createReadStream(
				currentChunkPath,
			);

			for await (const chunk of chunkReadStream) {
				hash.update(chunk);

				const canContinue = mergedWriteStream.write(chunk);
				if (!canContinue) {
					await once(mergedWriteStream, "drain");
				}
			}
		}

		mergedWriteStream.end();
		await once(mergedWriteStream, "finish");
	} catch (err) {
		mergedWriteStream.destroy();
		throw err;
	}

	const computedChecksum = hash.digest("hex");

	if (computedChecksum !== receivedChecksum) {
		console.error("Checksum mismatch! File integrity compromised.");
		throw new HttpError(
			HTTP_STATUS_CODES.BAD_REQUEST,
			"Checksum mismatch.",
		);
	}

	// Cleanup chunk files now that merged.zip is verified
	await Promise.all(
		filesInDir
			.filter((f) => f.startsWith("chunk_"))
			.map((f) =>
				fs.promises.unlink(path.join(transferDir, f)),
			),
	);

	console.log(CHUNKS_MERGED(accession, application));

	const mergedReadStream = fs.createReadStream(mergedPath);

	// Cleanup transfer directory after the merged file has been fully read
	mergedReadStream.on("close", () => {
		fs.promises
			.rm(transferDir, { recursive: true, force: true })
			.catch((err) => {
				console.error(
					"Error cleaning up transferDir:",
					err,
				);
			});
	});

	return mergedReadStream;
};
