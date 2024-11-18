import { TransferModel } from "../entities";
import type { TransferMongoose } from "../entities";

export const TransferService = {
	/**
	 * Inserts a new document into the Transfer collection.
	 * @param entry - The data to insert into the Transfer collection.
	 * @returns The inserted document.
	 * @throws Error if the insertion fails.
	 */
	async createTransferEntry(entry: TransferMongoose) {
		try {
			// Insert the document into the database
			const createdDocument = await TransferModel.create(entry);
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
	async createOrUpdateTransferEntry(entry: TransferMongoose) {
		try {
			// Ensure metadata and admin exist
			if (!entry.metadata || !entry.metadata.admin) {
				throw new Error("Invalid entry: metadata and admin fields are required.");
			}

			const { application, accession } = entry.metadata.admin;

			// Find an existing entry by `application` and `accession`
			const existingEntry = await TransferModel.findOne({
				"metadata.admin.application": application,
				"metadata.admin.accession": accession,
			});

			if (existingEntry) {
				// Update the existing entry
				existingEntry.set(entry);
				const updatedEntry = await existingEntry.save();
				return updatedEntry;
			}
			// Create a new entry if no match is found
			const createdEntry = await TransferModel.create(entry);
			return createdEntry;
		} catch (error) {
			console.error("Error in createOrUpdateTransferEntry:", error);
			throw new Error(
				`Failed to create or update Transfer entry: ${error instanceof Error ? error.message : error}`,
			);
		}
	},
};
