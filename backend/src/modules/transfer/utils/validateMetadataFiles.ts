import { z } from "zod";
import { fileMetadataZodSchema, folderMetadataZodSchema } from "src/modules/filelist/schemas";
import { adminMetadataZodSchema } from "../schemas";
import { HttpError, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";
import type { Buffer } from "node:buffer";
import JSZip from "jszip";

const foldersSchema = z.record(folderMetadataZodSchema);
const filesSchema = z.record(z.array(fileMetadataZodSchema));
const adminSchema = adminMetadataZodSchema;

type Data = {
	buffer: Buffer; // Zip of standard transfer
	accession: string;
	application: string;
};

export const validateMetadataFiles = async ({
	buffer,
	accession,
	application,
}: Data): Promise<void> => {
	const zip = await JSZip.loadAsync(buffer);

	// Check for "metadata/" folder
	const metadataFolder = zip.folder("metadata");
	if (!metadataFolder) {
		throw new HttpError(
			HTTP_STATUS_CODES.BAD_REQUEST,
			'The zip file is missing the "metadata/" folder.',
		);
	}

	// Check for required files in "metadata/"
	const requiredFiles = ["admin.json", "files.json", "folders.json"];
	const missingFiles = requiredFiles.filter((file) => !metadataFolder.file(file));

	if (missingFiles.length > 0) {
		throw new HttpError(
			HTTP_STATUS_CODES.BAD_REQUEST,
			`metadata/ is missing the following required files: ${missingFiles.join(", ")}.`,
		);
	}

	// Read and parse each file in "metadata/"
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const adminFile = JSON.parse(await metadataFolder.file("admin.json")!.async("string"));
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const filesFile = JSON.parse(await metadataFolder.file("files.json")!.async("string"));
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const foldersFile = JSON.parse(await metadataFolder.file("folders.json")!.async("string"));

	// Validate each file against its schema
	try {
		adminSchema.parse(adminFile);
	} catch (err) {
		throw new HttpError(
			HTTP_STATUS_CODES.BAD_REQUEST,
			`Validation failed for admin.json: ${err instanceof Error ? err.message : ""}`,
		);
	}

	try {
		filesSchema.parse(filesFile);
	} catch (err) {
		throw new HttpError(
			HTTP_STATUS_CODES.BAD_REQUEST,
			`Validation failed for files.json: ${err instanceof Error ? err.message : ""}`,
		);
	}

	try {
		foldersSchema.parse(foldersFile);
	} catch (err) {
		throw new HttpError(
			HTTP_STATUS_CODES.BAD_REQUEST,
			`Validation failed for folders.json: ${err instanceof Error ? err.message : ""}`,
		);
	}

	// Validate accession and application values in admin.json
	const { accession: adminAccession, application: adminApplication } = adminFile;

	if (!adminAccession || !adminApplication) {
		throw new HttpError(
			HTTP_STATUS_CODES.BAD_REQUEST,
			'The admin.json file is missing "accession" or "application" values.',
		);
	}

	if (adminAccession !== accession || adminApplication !== application) {
		throw new HttpError(
			HTTP_STATUS_CODES.BAD_REQUEST,
			"The accession or application values in admin.json are incorrect.",
		);
	}
};
