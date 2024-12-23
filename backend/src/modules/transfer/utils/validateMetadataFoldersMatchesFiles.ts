import { HttpError, HTTP_STATUS_CODES } from "@bcgov/citz-imb-express-utilities";
import type { Metadata } from "./getMetadata";

type Props = {
	metadata: Metadata;
};

/**
 * Validates that each folder record in the metadata has a matching record in the files property.
 * @param metadata - Metadata containing folder and file records.
 * @throws HttpError if any folder does not have a matching file record.
 */
export const validateMetadataFoldersMatchesFiles = ({ metadata }: Props): void => {
	const folderKeys = Object.keys(metadata.folders); // All folder paths from folders metadata
	const fileKeys = Object.keys(metadata.files); // All folder paths from files metadata

	// Find folders that are missing in the fileKeys
	const missingFolders = folderKeys.filter((folderKey) => !fileKeys.includes(folderKey));

	if (missingFolders.length > 0) {
		throw new HttpError(
			HTTP_STATUS_CODES.BAD_REQUEST,
			`The following folders (from metadata/folders.json) do not have matching file records (from metadata/files.json): ${missingFolders.join(", ")}.`,
		);
	}
};
