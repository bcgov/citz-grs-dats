import yauzl from "yauzl";
import path from "node:path";

export const getFileFromZipBuffer = (zipBuffer: Buffer, filePath: string): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipFile) => {
			if (err) return reject(err);
			if (!zipFile) return reject(new Error("Invalid zip file."));

			const targetFileName = path.basename(filePath); // Extract only the file name
			let fileFound = false;

			zipFile.on("entry", (entry) => {
				if (path.basename(entry.fileName) === targetFileName) {
					fileFound = true;
					zipFile.openReadStream(entry, (err, readStream) => {
						if (err) {
							zipFile.close();
							return reject(err);
						}
						const chunks: Buffer[] = [];
						readStream.on("data", (chunk) => chunks.push(chunk));
						readStream.on("end", () => {
							zipFile.close();
							resolve(Buffer.concat(chunks));
						});
					});
				} else {
					zipFile.readEntry();
				}
			});

			zipFile.on("end", () => {
				if (!fileFound) {
					zipFile.close();
					reject(new Error(`File ${filePath} not found in the zip.`));
				}
			});

			zipFile.readEntry();
		});
	});
};
