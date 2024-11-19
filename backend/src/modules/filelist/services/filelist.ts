import type { SSOUser } from "@bcgov/citz-imb-sso-js-core";
import { FileListModel } from "../entities";
import type { FileListMongoose } from "../entities";

type CreateFileListData = {
	jobID: string;
	user: SSOUser<unknown> | undefined;
	application: string;
	accession: string;
	outputFileType: string;
	folders: NonNullable<FileListMongoose["metadata"]>["folders"];
	files: NonNullable<FileListMongoose["metadata"]>["files"];
};

export const FileListService = {
	/**
	 * Inserts a new document into the FileList collection.
	 * @param entry - The data to insert into the FileList collection.
	 * @returns The inserted document.
	 * @throws Error if the insertion fails.
	 */
	async createFileListEntry({
		jobID,
		user,
		application,
		accession,
		outputFileType,
		folders,
		files,
	}: CreateFileListData) {
		try {
			const fileListDatabaseEntry: FileListMongoose = {
				jobID,
				outputFileType,
				metadata: {
					admin: {
						application,
						accession,
						submittedBy: {
							name: user?.display_name ?? "N/A",
							email: user?.email ?? "N/A",
						},
					},
					folders,
					files,
				},
			};

			// Insert the document into the database
			const createdDocument = await FileListModel.create(fileListDatabaseEntry);
			return createdDocument;
		} catch (error) {
			console.error("Error creating FileList entry:", error);
			throw new Error(
				`Failed to create FileList entry: ${error instanceof Error ? error.message : error}`,
			);
		}
	},
};
