import {
  fileMetadataZodSchema,
  folderMetadataZodSchema,
} from "@/modules/filelist/schemas";
import { z } from "zod";

// Schema for FormData fields
export const createTransferBodySchema = z.object({
  application: z.string(),
  accession: z.string(),
  chunkIndex: z.string(),
  totalChunks: z.string(),
  contentChecksum: z.string(),
});

export const downloadTransferBodySchema = z.object({
  application: z.string(),
  accession: z.string(),
});

export const preserveTransferBodySchema = z.object({
  application: z.string(),
  accession: z.string(),
});

export const removeTransferBodySchema = z.object({
  application: z.string(),
  accession: z.string(),
});

// TypeScript type inferred from Zod schema
export type CreateTransferBody = z.infer<typeof createTransferBodySchema>;
export type DownloadTransferBody = z.infer<typeof downloadTransferBodySchema>;
export type PreserveTransferBody = z.infer<typeof preserveTransferBodySchema>;
export type RemoveTransferBody = z.infer<typeof removeTransferBodySchema>;

// Schema for FormData fields
export const lanTransferBodySchema = z.object({
  fileListFilename: z.string(),
  transferFormFilename: z.string(),
  originalFoldersMetadata: z.record(folderMetadataZodSchema),
  metadataV2: z.object({
    admin: z
      .object({
        application: z.string().optional(),
        accession: z.string().optional(),
      })
      .optional(),
    folders: z.record(folderMetadataZodSchema),
    files: z.record(z.array(fileMetadataZodSchema)),
  }),
  extendedMetadata: z.record(z.any()),
  changes: z.array(
    z.object({
      originalFolderPath: z.string(),
      newFolderPath: z.string(),
      deleted: z.boolean(),
    })
  ),
  changesJustification: z.string(),
  chunkIndex: z.string(),
  totalChunks: z.string(),
  contentChecksum: z.string(),
});

// TypeScript type inferred from Zod schema
export type LanTransferBody = z.infer<typeof lanTransferBodySchema>;

// Schema for FormData fields
export const edrmsTransferBodySchema = z.object({
  fileListFilename: z.string(),
  dataportFilename: z.string(),
  transferFormFilename: z.string(),
  extendedMetadata: z.record(z.any()),
  metadata: z.object({
    admin: z
      .object({
        application: z.string().optional(),
        accession: z.string().optional(),
      })
      .optional(),
    folders: z.record(folderMetadataZodSchema),
    files: z.record(z.array(fileMetadataZodSchema)),
  }),
  chunkIndex: z.string(),
  totalChunks: z.string(),
  contentChecksum: z.string(),
});

// TypeScript type inferred from Zod schema
export type EDRMSTransferBody = z.infer<typeof edrmsTransferBodySchema>;
