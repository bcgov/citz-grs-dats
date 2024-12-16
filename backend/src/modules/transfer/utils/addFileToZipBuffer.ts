import yauzl from "yauzl";
import yazl from "yazl";

// Function to add a file to an existing zip buffer
export const addFileToZipBuffer = async (
	zipBuffer: Buffer,
	fileBuffer: Buffer,
	filePath: string,
): Promise<Buffer> => {
	const tempFiles: { [key: string]: Buffer } = {};

	// Extract files from the existing zip buffer, including subdirectories
	await new Promise<void>((resolve, reject) => {
		yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipFile) => {
			if (err || !zipFile) return reject(err);

			zipFile.readEntry();
			zipFile.on("entry", (entry) => {
				if (entry.fileName.endsWith("/")) {
					// Ignore directories when adding to yazl as it does not support empty directories
					zipFile.readEntry();
				} else {
					zipFile.openReadStream(entry, (err, readStream) => {
						if (err || !readStream) return reject(err);

						const chunks: Buffer[] = [];
						readStream.on("data", (chunk) => chunks.push(chunk));
						readStream.on("end", () => {
							tempFiles[entry.fileName] = Buffer.concat(chunks);
							zipFile.readEntry();
						});
					});
				}
			});

			zipFile.on("end", resolve);
			zipFile.on("error", reject);
		});
	});

	// Create a new zip file with the existing and new files
	const newZip = new yazl.ZipFile();
	Object.entries(tempFiles).forEach(([fileName, buffer]) => {
		newZip.addBuffer(buffer, fileName);
	});

	// Add the new file to the zip
	newZip.addBuffer(fileBuffer, filePath);

	const outputBuffer: Buffer = await new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		newZip.outputStream.on("data", (chunk) => chunks.push(chunk));
		newZip.outputStream.on("end", () => resolve(Buffer.concat(chunks)));
		newZip.outputStream.on("error", reject);
		newZip.end();
	});

	return outputBuffer;
};
