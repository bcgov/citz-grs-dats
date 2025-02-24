import type { SSOUser } from "@bcgov/citz-imb-sso-js-core";
import { TransferModel } from "../entities";
import type { TRANSFER_STATUSES, TransferMongoose } from "../entities";
import { logs } from "src/utils";

const {
  TRANSFER: {
    SERVICE: {
      ERROR_CREATING_ENTRY,
      ERROR_CREATING_OR_UPDATING_ENTRY,
      ERROR_IN_GET_TRANSFER_WHERE,
      ERROR_UPDATING_ENTRY,
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
          folders,
          files,
        },
        extendedMetadata: new Map(Object.entries(extendedMetadata)),
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
          folders,
          files,
        },
        extendedMetadata: new Map(Object.entries(extendedMetadata)),
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
   * Updates a Transfer entry based on `application` and `accession`.
   * @param application - The application identifier.
   * @param accession - The accession identifier.
   * @param updates - The properties to update.
   * @returns The updated document.
   * @throws Error if the update fails.
   */
  async updateTransferEntry(
    application: string,
    accession: string,
    updates: UpdateTransferData
  ) {
    try {
      const transferDocument = await TransferModel.findOne({
        "metadata.admin.application": application,
        "metadata.admin.accession": accession,
      });

      if (!transferDocument) {
        throw new Error("Transfer entry not found.");
      }

      if (updates.user && transferDocument.metadata?.admin) {
        transferDocument.metadata.admin.submittedBy = {
          name:
            updates.user.display_name ??
            transferDocument.metadata?.admin?.submittedBy?.name!,
          email:
            updates.user.email ??
            transferDocument.metadata?.admin?.submittedBy?.email!,
        };
      }

      if (updates.folders && transferDocument.metadata) {
        transferDocument.metadata.folders = updates.folders;
      }

      if (updates.files && transferDocument.metadata) {
        transferDocument.metadata.files = updates.files;
      }

      if (updates.jobID !== undefined) {
        transferDocument.jobID = updates.jobID as NonNullable<
          TransferMongoose["jobID"]
        >;
      }

      if (updates.status) {
        transferDocument.status = updates.status;
      }

      const updatedDocument = await transferDocument.save();
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
};
