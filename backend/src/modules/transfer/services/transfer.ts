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
};
