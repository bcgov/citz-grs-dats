import crypto from "node:crypto";

/**
 * Generate a checksum for a buffer.
 * @param buffer - The buffer to checksum.
 * @param algorithm - Hashing algorithm (e.g., 'sha256', 'md5').
 * @returns The checksum as a hexadecimal string.
 */
export const generateChecksum = (buffer: Buffer, algorithm = "sha256"): string => {
	const hash = crypto.createHash(algorithm);
	hash.update(buffer);
	return hash.digest("hex");
};
