import crypto from "node:crypto";
import yauzl from "yauzl";
import { HttpError, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";

type Props = {
	buffer: Buffer;
	checksum: string;
	filePath?: string;
};

/**
 * Validates a buffer and checksum. If a filePath is provided, validates the checksum
 * against the file within the buffer if it's a valid zip archive.
 *
 * @param props - Object containing buffer, checksum, and optional filePath.
 * @returns True if checksum matches; otherwise, false.
 * @throws HttpError if the buffer is not a valid zip file or validation fails.
 */
export const isChecksumValid = async ({ buffer, checksum, filePath }: Props): Promise<boolean> => {
	const calculateChecksum = (data: Buffer): string => {
		const hash = crypto.createHash("sha256");
		hash.update(data);
		return hash.digest("hex");
	};

	if (filePath) {
		// Create a promise to validate the zip
		return new Promise<boolean>((resolve, reject) => {
			yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
				if (err) {
					return reject(
						new HttpError(
							HTTP_STATUS_CODES.BAD_REQUEST,
							"Provided buffer is not a valid zip file.",
						),
					);
				}

				zipFile.on("entry", (entry) => {
					if (entry.fileName === filePath) {
						zipFile.openReadStream(entry, (err, readStream) => {
							if (err || !readStream) {
								return reject(
									new HttpError(
										HTTP_STATUS_CODES.BAD_REQUEST,
										`Error reading file at path "${filePath}".`,
									),
								);
							}

							const chunks: Buffer[] = [];
							readStream.on("data", (chunk) => chunks.push(chunk));
							readStream.on("end", () => {
								const fileBuffer = Buffer.concat(chunks);
								const fileChecksum = calculateChecksum(fileBuffer);

								if (fileChecksum === checksum) {
									resolve(true);
								} else {
									reject(false);
								}
								zipFile.close();
							});
						});
					} else {
						zipFile.readEntry();
					}
				});

				zipFile.on("end", () => {
					reject(
						new HttpError(
							HTTP_STATUS_CODES.NOT_FOUND,
							`File at path "${filePath}" not found in the zip buffer.`,
						),
					);
				});

				zipFile.readEntry();
			});
		});
	}

	// If no filePath is provided, validate the checksum of the entire buffer
	const bufferChecksum = calculateChecksum(buffer);
	if (bufferChecksum === checksum) return true;
	return false;
};
