import { FileListModel } from "../entities";
import type { FileListMongoose } from "../entities";

export const FileListService = {
	/**
	 * Inserts a new document into the FileList collection.
	 * @param entry - The data to insert into the FileList collection.
	 * @returns The inserted document.
	 * @throws Error if the insertion fails.
	 */
	async createFileListEntry(entry: FileListMongoose) {
		try {
			// Insert the document into the database
			const createdDocument = await FileListModel.create(entry);
			return createdDocument;
		} catch (error) {
			console.error("Error creating FileList entry:", error);
			throw new Error(
				`Failed to create FileList entry: ${error instanceof Error ? error.message : error}`,
			);
		}
	},
};
