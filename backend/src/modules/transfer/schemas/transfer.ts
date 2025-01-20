import {
  fileMetadataZodSchema,
  folderMetadataZodSchema,
} from "@/modules/filelist/schemas";
import { z } from "zod";

// Schema for FormData fields
export const createTransferBodySchema = z.object({
  file: z.any(),
  checksum: z.string(),
  application: z.string(),
  accession: z.string(),
});

// TypeScript type inferred from Zod schema
export type CreateTransferBody = z.infer<typeof createTransferBodySchema>;

// Schema for FormData fields
export const lanTransferBodySchema = z.object({
  fileListBuffer: z.any(),
  fileListFilename: z.string(),
  transferFormBuffer: z.any(),
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
  changes: z.array(
    z.object({
      originalFolderPath: z.string(),
      newFolderPath: z.string(),
      deleted: z.boolean(),
    })
  ),
  changesJustification: z.string(),
  contentBuffer: z.any(),
});

// TypeScript type inferred from Zod schema
export type LanTransferBody = z.infer<typeof lanTransferBodySchema>;
