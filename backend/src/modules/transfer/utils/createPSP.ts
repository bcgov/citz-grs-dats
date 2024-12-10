import yauzl from "yauzl";
import yazl from "yazl";
import { createBagitFiles } from "./createBagitFiles";
import type { TransferZod } from "../entities";
import path from "node:path";

type Props = {
	folderContent: string[];
	buffer: Buffer;
	metadata: TransferZod["metadata"];
};

export const createPSP = async ({ folderContent, buffer, metadata }: Props): Promise<Buffer> => {
	const bagitFiles = createBagitFiles({ files: metadata.files, folders: folderContent });

	const outputZip = new yazl.ZipFile();
	const chunks: Buffer[] = [];

	// Open the input ZIP file from the buffer
	await new Promise<void>((resolve, reject) => {
		yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
			if (err) return reject(err);

			zipFile.readEntry();
			zipFile.on("entry", (entry) => {
				const entryPath = entry.fileName;

				if (entryPath.startsWith("metadata/") || entryPath.startsWith("documentation/")) {
					zipFile.openReadStream(entry, (err, readStream) => {
						if (err) return reject(err);
						const newPath = entryPath
							.replace("metadata/", "metadata/")
							.replace("documentation/", "documentation/");
						const entryChunks: Buffer[] = [];
						readStream.on("data", (chunk) => entryChunks.push(chunk));
						readStream.on("end", () => {
							const fileBuffer = Buffer.concat(entryChunks);
							outputZip.addBuffer(fileBuffer, newPath);
							zipFile.readEntry();
						});
					});
				} else if (entryPath.startsWith("content/")) {
					const folderName = path.basename(entryPath.split("/")[1]);
					if (folderContent.includes(folderName)) {
						zipFile.openReadStream(entry, (err, readStream) => {
							if (err) return reject(err);
							const newPath = entryPath.replace("content/", "data/");
							const entryChunks: Buffer[] = [];
							readStream.on("data", (chunk) => entryChunks.push(chunk));
							readStream.on("end", () => {
								const fileBuffer = Buffer.concat(entryChunks);
								outputZip.addBuffer(fileBuffer, newPath);
								zipFile.readEntry();
							});
						});
					} else {
						zipFile.readEntry();
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

	// Collect the ZIP output
	outputZip.outputStream.on("data", (chunk) => chunks.push(chunk));
	await new Promise((resolve) => outputZip.outputStream.on("end", resolve));

	return Buffer.concat(chunks);
};
