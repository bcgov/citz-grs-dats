import yazl from "yazl";

export const createFinalTransfer = async (
	pspArray: { buffer: Buffer; schedule: string; classification: string }[],
): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		const zipFile = new yazl.ZipFile();
		const chunks: Buffer[] = [];

		// Collect zip data into chunks
		zipFile.outputStream
			.on("data", (chunk) => chunks.push(chunk))
			.on("end", () => resolve(Buffer.concat(chunks)))
			.on("error", (err) => reject(err));

		// Add PSP buffers to the archive
		for (const { buffer, schedule, classification } of pspArray) {
			const zipFileName = `PSP_${schedule}_${classification}.zip`;
			zipFile.addBuffer(buffer, zipFileName);
		}

		// Finalize the archive
		zipFile.end();
	});
};
