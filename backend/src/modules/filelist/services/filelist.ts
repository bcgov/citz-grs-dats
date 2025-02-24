import type { SSOUser } from "@bcgov/citz-imb-sso-js-core";
import { FileListModel } from "../entities";
import type { FileListMongoose } from "../entities";
import { logs } from "src/utils";

const {
  FILELIST: {
    SERVICE: {
      ERROR_CREATING_ENTRY,
      ERROR_DELETING_ENTRY,
      ERROR_RETRIEVING_ENTRY_BY_JOBID,
    },
  },
} = logs;

type CreateFileListData = {
  jobID: string;
  user: SSOUser<unknown> | undefined;
  application: string;
  accession: string;
  outputFileType: "excel" | "json";
  folders: NonNullable<FileListMongoose["metadata"]>["folders"];
  files: NonNullable<FileListMongoose["metadata"]>["files"];
  extendedMetadata?: Record<string, unknown> | undefined;
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
    extendedMetadata = {},
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
        extendedMetadata: new Map(Object.entries(extendedMetadata)),
      };

      // Insert the document into the database
      const createdDocument = await FileListModel.create(fileListDatabaseEntry);
      return createdDocument;
    } catch (error) {
      console.error(ERROR_CREATING_ENTRY, error);
      throw new Error(
        `Failed to create FileList entry: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  },

  /**
   * Retrieves a document from the FileList collection by jobID.
   * @param jobID - The ID of the job to fetch.
   * @returns The matching document or null if not found.
   * @throws Error if the retrieval fails.
   */
  async getFileListByJobID(jobID: string) {
    try {
      const document = await FileListModel.findOne({ jobID }).lean().exec();
      return document;
    } catch (error) {
      console.error(ERROR_RETRIEVING_ENTRY_BY_JOBID(jobID), error);
      throw new Error(
        `Failed to retrieve FileList entry: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  },

  /**
   * Deletes a document from the FileList collection by jobID.
   * @param jobID - The ID of the job to delete.
   * @returns The result of the delete operation.
   * @throws Error if the deletion fails.
   */
  async deleteFileListByJobID(jobID: string) {
    try {
      const deleteResult = await FileListModel.deleteOne({ jobID }).exec();
      return deleteResult;
    } catch (error) {
      console.error(ERROR_DELETING_ENTRY, error);
      throw new Error(
        `Failed to delete FileList entry: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  },
};
