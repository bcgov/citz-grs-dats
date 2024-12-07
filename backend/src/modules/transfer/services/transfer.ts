import type { SSOUser } from "@bcgov/citz-imb-sso-js-core";
import { TransferModel } from "../entities";
import type { TransferMongoose } from "../entities";

type CreateTransferData = {
	user: SSOUser<unknown> | undefined;
	application: string;
	accession: string;
	folders: NonNullable<TransferMongoose["metadata"]>["folders"];
	files: NonNullable<TransferMongoose["metadata"]>["files"];
};

export const TransferService = {
	/**
	 * Inserts a new document into the Transfer collection.
	 * @param entry - The data to insert into the Transfer collection.
	 * @returns The inserted document.
	 * @throws Error if the insertion fails.
	 */
	async createTransferEntry({ user, application, accession, folders, files }: CreateTransferData) {
		try {
			const transferDatabaseEntry: TransferMongoose = {
				metadata: {
					admin: {
						application,
						accession,
						submittedBy: {
							name: user?.display_name ?? "",
							email: user?.email ?? "",
						},
					},
					folders,
					files,
				},
			};

			// Insert the document into the database
			const createdDocument = await TransferModel.create(transferDatabaseEntry);
			return createdDocument;
		} catch (error) {
			console.error("Error creating Transfer entry:", error);
			throw new Error(
				`Failed to create Transfer entry: ${error instanceof Error ? error.message : error}`,
			);
		}
	},

	/**
	 * Creates or updates a Transfer entry based on `application` and `accession`.
	 * @param entry - The data to insert or update in the Transfer collection.
	 * @returns The upserted or updated document.
	 * @throws Error if the operation fails.
	 */
	async createOrUpdateTransferEntry({
		user,
		application,
		accession,
		folders,
		files,
	}: CreateTransferData) {
		try {
			const transferDatabaseEntry: TransferMongoose = {
				metadata: {
					admin: {
						application,
						accession,
						submittedBy: {
							name: user?.display_name ?? "",
							email: user?.email ?? "",
						},
					},
					folders,
					files,
				},
			};

			// Find an existing entry by `application` and `accession`
			const existingEntry = await TransferModel.findOne({
				"metadata.admin.application": application,
				"metadata.admin.accession": accession,
			});

			if (existingEntry) {
				// Update the existing entry
				existingEntry.set(transferDatabaseEntry);
				const updatedEntry = await existingEntry.save();
				return updatedEntry;
			}
			// Create a new entry if no match is found
			const createdEntry = await TransferModel.create(transferDatabaseEntry);
			return createdEntry;
		} catch (error) {
			console.error("Error in createOrUpdateTransferEntry:", error);
			throw new Error(
				`Failed to create or update Transfer entry: ${error instanceof Error ? error.message : error}`,
			);
		}
	},
};
