import type { TransferZod } from "@/modules/transfer/entities";
import type { FileMetadataZodType } from "@/modules/filelist/schemas";

export const createBagitFiles = (
	files: TransferZod["metadata"]["files"],
): { bagit: Buffer; manifest: Buffer } => {
	// Create the content for bagit.txt
	const bagitContent = "BagIt-Version: 1.0\nTag-File-Character-Encoding: UTF-8\n";

	// Create the content for the manifest file
	let manifestContent = "";
	Object.entries(files).forEach(([_, fileArray]) => {
		fileArray.forEach((file: FileMetadataZodType) => {
			manifestContent += `${file.checksum} data/${file.filepath}\n`;
		});
	});

	// Return both buffers
	return {
		bagit: Buffer.from(bagitContent, "utf-8"),
		manifest: Buffer.from(manifestContent, "utf-8"),
	};
};
