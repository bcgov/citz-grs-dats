import {
  fileMetadataSchema,
  fileMetadataZodSchema,
  folderMetadataSchema,
  folderMetadataZodSchema,
} from "src/modules/filelist/schemas";
import { Schema, model, type InferSchemaType } from "mongoose";
import { z } from "zod";

export const TRANSFER_STATUSES = [
  "Pre-Transfer",
  "Transferring",
  "Transferred",
  "Downloaded",
  "Downloaded & Preserved",
  "Preserved",
] as const;

// Mongoose Schema
const transferSchema = new Schema({
  createdOn: {
    type: String,
    required: false,
    default: () => new Date().toDateString(),
  },
  status: { type: String, enum: TRANSFER_STATUSES, required: true },
  jobID: { type: String, required: false },
  checksum: { type: String, required: false },
  metadata: {
    type: new Schema(
      {
        admin: {
          type: new Schema(
            {
              application: { type: String, required: true },
              accession: { type: String, required: true },
              submittedBy: {
                type: new Schema(
                  {
                    name: { type: String, required: true },
                    email: { type: String, required: true },
                  },
                  { _id: false }
                ),
                required: true,
              },
            },
            { _id: false }
          ),
          required: true,
        },
        folders: { type: Map, of: folderMetadataSchema, required: true },
        files: { type: Map, of: [fileMetadataSchema], required: true },
      },
      { _id: false }
    ),
    required: true,
  },
  extendedMetadata: { type: Map, of: Schema.Types.Mixed, required: false },
  transferDate: { type: String, required: false },
});

transferSchema.index({
  "metadata.admin.application": 1,
  "metadata.admin.accession": 1,
});

// Mongoose Model
export const TransferModel = model("Transfer", transferSchema);

export const adminMetadataZodSchema = z.object({
  application: z.string(),
  accession: z.string(),
  submittedBy: z
    .object({
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});

// Zod Schema
export const transferZodSchema = z.object({
  createdOn: z.string().optional(),
  status: z.enum(TRANSFER_STATUSES),
  jobID: z.union([z.string(), z.null()]).optional(),
  checksum: z.union([z.string(), z.null()]).optional(),
  metadata: z.object({
    admin: adminMetadataZodSchema,
    folders: z.record(folderMetadataZodSchema),
    files: z.record(z.array(fileMetadataZodSchema)),
  }),
  extendedMetadata: z.record(z.any()).optional(),
  transferDate: z.string().optional(),
});

// TypeScript Types
export type TransferMongoose = InferSchemaType<typeof transferSchema>;
export type TransferZod = z.infer<typeof transferZodSchema>;
