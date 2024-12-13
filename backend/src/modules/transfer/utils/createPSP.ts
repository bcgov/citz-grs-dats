import yauzl from "yauzl";
import yazl from "yazl";
import { createBagitFiles } from "./createBagitFiles";
import type { AdminMetadataZodType } from "../schemas";
import type { TransferZod } from "../entities";

type Props = {
	folderContent: string[];
	buffer: Buffer; // Standard transfer zip
	metadata: {
		admin: AdminMetadataZodType | TransferZod["metadata"]["admin"];
		folders: TransferZod["metadata"]["folders"];
		files: TransferZod["metadata"]["files"];
	};
};

export const createPSP = async ({ folderContent, buffer, metadata }: Props): Promise<Buffer> => {
	const bagitFiles = createBagitFiles({ files: metadata.files, folders: folderContent });

	const outputZip = new yazl.ZipFile();
	const chunks: Buffer[] = [];

	await new Promise<void>((resolve, reject) => {
		yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
			if (err) return reject(err);

			const allowedFolders = new Set(
				folderContent.map((folder) => {
					const folderNameParts = folder.replaceAll("\\", "/").split("/");
					const folderName = folderNameParts[folderNameParts.length - 1];
					return `content/${folderName}/`;
				}),
			);

			zipFile.readEntry();
			zipFile.on("entry", (entry) => {
				const entryPath = entry.fileName;

				if (entryPath.startsWith("metadata/") || entryPath.startsWith("documentation/")) {
					zipFile.openReadStream(entry, (err, readStream) => {
						if (err) return reject(err);
						const newPath = entryPath;
						const entryChunks: Buffer[] = [];
						readStream.on("data", (chunk) => entryChunks.push(chunk));
						readStream.on("end", () => {
							const fileBuffer = Buffer.concat(entryChunks);
							outputZip.addBuffer(fileBuffer, newPath);
							zipFile.readEntry();
						});
					});
				} else if (entryPath.startsWith("content/")) {
					const relativePath = entryPath.replace("content/", "data/");

					// Check if the entryPath belongs to an allowed folder or its subdirectory
					const folderMatch = Array.from(allowedFolders).some((folder) =>
						entryPath.startsWith(folder),
					);

					if (folderMatch && !relativePath.endsWith("/")) {
						// Ensure it's a file, not a directory
						zipFile.openReadStream(entry, (err, readStream) => {
							if (err) return reject(err);
							const entryChunks: Buffer[] = [];
							readStream.on("data", (chunk) => entryChunks.push(chunk));
							readStream.on("end", () => {
								const fileBuffer = Buffer.concat(entryChunks);
								outputZip.addBuffer(fileBuffer, relativePath);
								zipFile.readEntry();
							});
						});
					} else if (!folderMatch) {
						zipFile.readEntry(); // Skip directories or files not in allowed folders
					} else {
						zipFile.readEntry(); // Skip directories
					}
				} else {
					zipFile.readEntry();
				}
			});

			zipFile.on("end", () => {
				outputZip.addBuffer(bagitFiles.bagit, "bagit.txt");
				outputZip.addBuffer(bagitFiles.manifest, "manifest-sha256.txt");
				outputZip.end();
				resolve();
			});
		});
	});

	outputZip.outputStream.on("data", (chunk) => chunks.push(chunk));
	await new Promise((resolve) => outputZip.outputStream.on("end", resolve));

	return Buffer.concat(chunks);
};
