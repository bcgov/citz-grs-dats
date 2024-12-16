import yauzl from "yauzl";

type Props = {
	buffer: Buffer;
	directory: string;
	regex: RegExp;
};

export const getFilenameByRegex = async ({
	buffer,
	directory,
	regex,
}: Props): Promise<string | null> => {
	return new Promise((resolve, reject) => {
		yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
			if (err) return reject(err);

			if (!zipFile) return reject(new Error("Invalid zip file"));

			let matchedFilename: string | null = null;

			zipFile.readEntry();

			zipFile.on("entry", (entry) => {
				const isInDirectory = entry.fileName.startsWith(directory);
				if (isInDirectory) {
					const relativeFilename = entry.fileName.slice(directory.length);
					if (regex.test(relativeFilename)) {
						matchedFilename = relativeFilename;
						zipFile.close();
						resolve(matchedFilename); // Immediately resolve when a match is found
						return;
					}
				}
				zipFile.readEntry();
			});

			zipFile.on("end", () => {
				resolve(matchedFilename);
			});

			zipFile.on("error", (zipErr) => {
				reject(zipErr);
			});
		});
	});
};
