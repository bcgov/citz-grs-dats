import type { SSOUser } from "@bcgov/citz-imb-sso-js-core";
import { TransferModel } from "../entities";
import type { TRANSFER_STATUSES, TransferMongoose } from "../entities";
import { decodeKeysBase64, encodeKeysBase64, logs } from "src/utils";

const {
  TRANSFER: {
    SERVICE: {
      ERROR_CREATING_ENTRY,
      ERROR_CREATING_OR_UPDATING_ENTRY,
      ERROR_IN_GET_TRANSFER_WHERE,
      ERROR_IN_GET_TRANSFERS,
      ERROR_UPDATING_ENTRY,
      ERROR_DELETING_ENTRY,
    },
  },
} = logs;

type CreateTransferData = {
  user?: SSOUser<unknown> | undefined;
  application: string;
  accession: string;
  folders: NonNullable<TransferMongoose["metadata"]>["folders"];
  files: NonNullable<TransferMongoose["metadata"]>["files"];
  jobID?: string | null;
  checksum?: string | null;
  status?: (typeof TRANSFER_STATUSES)[number];
  extendedMetadata?: Record<string, unknown> | undefined;
  transferDate?: string;
};

type UpdateTransferData = Partial<
  Omit<CreateTransferData, "application" | "accession">
>;

export const TransferService = {
  /**
   * Inserts a new document into the Transfer collection.
   * @param entry - The data to insert into the Transfer collection.
   * @returns The inserted document.
   * @throws Error if the insertion fails.
   */
  async createTransferEntry({
    user,
    application,
    accession,
    folders,
    files,
    jobID,
    checksum,
    status = "Pre-Transfer",
    extendedMetadata = {},
  }: CreateTransferData) {
    try {
      const transferDatabaseEntry: TransferMongoose = {
        status,
        jobID: jobID as NonNullable<TransferMongoose["jobID"]>,
        checksum: checksum as NonNullable<TransferMongoose["checksum"]>,
        metadata: {
          admin: {
            application,
            accession,
            submittedBy: {
              name: user?.display_name ?? "",
              email: user?.email ?? "",
            },
          },
          folders: encodeKeysBase64(folders),
          files: encodeKeysBase64(files),
        },
        extendedMetadata: encodeKeysBase64(extendedMetadata),
      };

      // Insert the document into the database
      const createdDocument = await TransferModel.create(transferDatabaseEntry);
      return createdDocument;
    } catch (error) {
      console.error(ERROR_CREATING_ENTRY, error);
      throw new Error(
        `Failed to create Transfer entry: ${
          error instanceof Error ? error.message : error
        }`
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
    jobID,
    checksum,
    status = "Pre-Transfer",
    extendedMetadata = {},
  }: CreateTransferData) {
    try {
      const transferDatabaseEntry: TransferMongoose = {
        status,
        jobID: jobID as NonNullable<TransferMongoose["jobID"]>,
        checksum: checksum as NonNullable<TransferMongoose["checksum"]>,
        metadata: {
          admin: {
            application,
            accession,
            submittedBy: {
              name: user?.display_name ?? "",
              email: user?.email ?? "",
            },
          },
          folders: encodeKeysBase64(folders),
          files: encodeKeysBase64(files),
        },
        extendedMetadata: encodeKeysBase64(extendedMetadata),
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
      console.error(ERROR_CREATING_OR_UPDATING_ENTRY, error);
      throw new Error(
        `Failed to create or update Transfer entry: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  },

  /**
   * Retrieves a single Transfer entry that matches the given `where` clause.
   * @param where - The query conditions to find the Transfer document.
   * @returns The Transfer document or null if none found.
   * @throws Error if the retrieval fails.
   */
  async getTransferWhere(where: Record<string, unknown>) {
    try {
      const transferDocument = await TransferModel.findOne(where).lean().exec();

      if (transferDocument?.metadata?.folders) {
        transferDocument.metadata.folders = decodeKeysBase64(
          transferDocument.metadata.folders
        );
      }
      if (transferDocument?.metadata?.files) {
        transferDocument.metadata.files = decodeKeysBase64(
          transferDocument.metadata.files
        );
      }
      if (transferDocument?.extendedMetadata) {
        transferDocument.extendedMetadata = decodeKeysBase64(
          transferDocument.extendedMetadata
        );
      }

      return transferDocument;
    } catch (error) {
      console.error(ERROR_IN_GET_TRANSFER_WHERE, error);
      throw new Error(
        `Failed to get Transfer entry: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  },

  /**
   * Retrieves all completed Transfer entries.
   * @returns The Transfer documents.
   * @throws Error if the retrieval fails.
   */
  async getCompletedTransfers() {
    try {
      const transferDocuments = await TransferModel.find({
        status: {
          $in: [
            "Transferred",
            "Downloaded",
            "Preserved",
            "Downloaded & Preserved",
          ],
        },
      })
        .lean()
        .exec();
      return transferDocuments;
    } catch (error) {
      console.error(ERROR_IN_GET_TRANSFERS, error);
      throw new Error(
        `Failed to get Transfer entry: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  },

  /**
   * Updates a Transfer entry based on `application` and `accession`.
   * @param application - The application identifier.
   * @param accession - The accession identifier.
   * @param updates - The properties to update.
   * @returns The updated document.
   * @throws Error if the update fails.
   */
  async updateTransferEntry(
    accession: string,
    application: string,
    updates: UpdateTransferData
  ) {
    try {
      // Construct the update object dynamically
      const updateFields: Record<string, unknown> = {};

      // Update submittedBy if `updates.user` exists
      if (updates.user) {
        updateFields["metadata.admin.submittedBy"] = {
          name: updates.user.display_name ?? undefined,
          email: updates.user.email ?? undefined,
        };
      }

      // Update folders if provided
      if (updates.folders) {
        updateFields["metadata.folders"] = encodeKeysBase64(updates.folders);
      }

      // Update files if provided
      if (updates.files) {
        updateFields["metadata.files"] = encodeKeysBase64(updates.files);
      }

      // Update other top-level fields
      if (updates.jobID !== undefined) {
        updateFields.jobID = updates.jobID;
      }

      if (updates.transferDate !== undefined) {
        updateFields.transferDate = updates.transferDate;
      }

      if (updates.status) {
        updateFields.status = updates.status;
      }

      // Find and update the document in one atomic operation
      const updatedDocument = await TransferModel.findOneAndUpdate(
        {
          "metadata.admin.application": String(application),
          "metadata.admin.accession": String(accession),
        },
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      // Throw error if no document was found
      if (!updatedDocument) {
        throw new Error(
          `Transfer entry not found with accession: ${accession}, application: ${application}.`
        );
      }

      return updatedDocument;
    } catch (error) {
      console.error(ERROR_UPDATING_ENTRY, error);
      throw new Error(
        `Failed to update Transfer entry: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  },

  /**
   * Deletes a Transfer entry based on `application` and `accession`.
   * @param application - The application identifier.
   * @param accession - The accession identifier.
   * @returns The deleted document.
   * @throws Error if the deletion fails or if the document is not found.
   */
  async deleteTransferEntry(accession: string, application: string) {
    try {
      // Find and delete the document in one atomic operation
      const deletedDocument = await TransferModel.findOneAndDelete({
        "metadata.admin.application": String(application),
        "metadata.admin.accession": String(accession),
      });

      // Throw error if no document was found
      if (!deletedDocument) {
        throw new Error(
          `Transfer entry not found with accession: ${accession}, application: ${application}.`
        );
      }

      return deletedDocument;
    } catch (error) {
      console.error(ERROR_DELETING_ENTRY, error);
      throw new Error(
        `Failed to delete Transfer entry: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  },
};
