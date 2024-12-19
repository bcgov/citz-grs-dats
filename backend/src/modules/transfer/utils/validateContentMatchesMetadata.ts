import type { Buffer } from "node:buffer";
import yauzl from "yauzl";
import { HttpError, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";
import type { Metadata } from "./getMetadata";

type Props = {
	buffer: Buffer;
	metadata: Metadata;
};

export const validateContentMatchesMetadata = async ({
	buffer,
	metadata,
}: Props): Promise<void> => {
	const foundContentEntries = new Set<string>();
	const folderPaths = Object.keys(metadata.folders); // Get all folder paths from the metadata
	const folderNames = folderPaths.map((folderPath) => {
		const folderParts = folderPath.replaceAll("\\", "/").split("/");
		return `content/${folderParts[folderParts.length - 1]}/`; // Get the folder name from the path
	});

	await new Promise<void>((resolve, reject) => {
		yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
			if (err) {
				return reject(
					new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Provided buffer is not a valid zip file."),
				);
			}

			zipFile.readEntry();

			// Event listener for each entry in the zip
			zipFile.on("entry", (entry) => {
				const parts = entry.fileName.split("/");
				const parentDirectory = parts[0];

				// Check if this entry is in the 'content' directory and matches any folder from metadata
				if (parentDirectory === "content" && folderNames.includes(entry.fileName)) {
					foundContentEntries.add(entry.fileName);
				}

				zipFile.readEntry();
			});

			// On end, validate the structure
			zipFile.on("end", () => {
				// Validate folders in the metadata exist in the zip file's content directory
				const missingFolders = folderNames.filter((folderName) => {
					const foundFolders = Array.from(foundContentEntries);
					return !foundFolders.includes(folderName);
				});

				if (missingFolders.length > 0) {
					return reject(
						new HttpError(
							HTTP_STATUS_CODES.BAD_REQUEST,
							`The zip file is missing required folders: ${missingFolders.join(", ")}.`,
						),
					);
				}

				resolve();
			});

			zipFile.on("error", (zipErr) => {
				reject(
					new HttpError(
						HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
						`Error reading zip file: ${zipErr.message}`,
					),
				);
			});
		});
	});
};
