import type { Buffer } from "node:buffer";
import yauzl from "yauzl";
import { HttpError, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";

type Data = {
	buffer: Buffer;
};

type FileCheck = {
	regex: RegExp;
	allowedExtensions: string[];
	parentDirectory: string;
	errorMessage: string;
};

const fileChecks: FileCheck[] = [
	{
		regex: /^(Digital_File_List_|File\sList)/,
		allowedExtensions: ["xlsx", "json"],
		parentDirectory: "documentation",
		errorMessage:
			"Digital File List (beginning with 'Digital_File_List_' or 'File List') must be included and have a .xlsx or .json extension in the documentation directory.",
	},
	{
		regex: /^(Transfer_Form_|617)/,
		allowedExtensions: ["pdf"],
		parentDirectory: "documentation",
		errorMessage:
			"Transfer Form ARS 617 (beginning with 'Transfer_Form_' or '617') must be included and have a .pdf extension in the documentation directory.",
	},
	{
		regex: /^Submission_Agreement_/,
		allowedExtensions: ["pdf"],
		parentDirectory: "documentation",
		errorMessage:
			"Submission Agreement (beginning with 'Submission_Agreement_') must be included and have a .pdf extension in the documentation directory.",
	},
	{
		regex: /^admin/,
		allowedExtensions: ["json"],
		parentDirectory: "metadata",
		errorMessage: "admin.json must be included in the metadata directory.",
	},
	{
		regex: /^files/,
		allowedExtensions: ["json"],
		parentDirectory: "metadata",
		errorMessage: "files.json must be included in the metadata directory.",
	},
	{
		regex: /^folders/,
		allowedExtensions: ["json"],
		parentDirectory: "metadata",
		errorMessage: "folders.json must be included in the metadata directory.",
	},
];

export const validateStandardTransferStructure = async ({ buffer }: Data): Promise<void> => {
	const requiredDirectories = new Set(["content", "documentation", "metadata"]);
	const foundTopLevelEntries = new Set<string>();
	const foundFiles = new Set<string>();

	await new Promise<void>((resolve, reject) => {
		yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
			if (err) {
				return reject(
					new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, "Provided buffer is not a valid zip file."),
				);
			}

			zipFile.readEntry();

			// Event listener for each entry
			zipFile.on("entry", (entry) => {
				const parts = entry.fileName.split("/");
				const parentDirectory = parts[0];
				const fileName = parts[1];
				const fileExtension = fileName?.split(".").pop();

				if (parentDirectory) foundTopLevelEntries.add(parentDirectory);

				if (fileName) {
					// Perform file checks
					fileChecks.forEach((check) => {
						if (
							parentDirectory === check.parentDirectory &&
							check.regex.test(fileName) &&
							check.allowedExtensions.includes(fileExtension)
						) {
							foundFiles.add(`${check.parentDirectory}/${fileName}`);
						}
					});
				}

				zipFile.readEntry();
			});

			// On end, validate the structure
			zipFile.on("end", () => {
				// Validate top-level directories
				const missingDirectories = [...requiredDirectories].filter(
					(dir) => !foundTopLevelEntries.has(dir),
				);

				if (missingDirectories.length > 0) {
					return reject(
						new HttpError(
							HTTP_STATUS_CODES.BAD_REQUEST,
							`Zip file is missing required directories: ${missingDirectories.join(", ")}.`,
						),
					);
				}

				// Validate all required files are found
				const missingFiles = fileChecks.filter((check) => {
					return ![...foundFiles].some(
						(foundFile) =>
							foundFile.startsWith(`${check.parentDirectory}/`) &&
							check.regex.test(foundFile.split("/").pop() || ""),
					);
				});

				if (missingFiles.length > 0) {
					return reject(
						new HttpError(
							HTTP_STATUS_CODES.BAD_REQUEST,
							`The zip file is missing required files: ${missingFiles
								.map((file) => file.errorMessage)
								.join(" ")}`,
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
