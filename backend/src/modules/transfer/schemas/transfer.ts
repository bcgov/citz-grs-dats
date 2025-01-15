import { fileMetadataZodSchema } from "@/modules/filelist/schemas";
import { z } from "zod";

// Schema for FormData fields
export const createTransferBodySchema = z.object({
  buffer: z.any(),
  checksum: z.string(),
  application: z.string(),
  accession: z.string(),
});

// TypeScript type inferred from Zod schema
export type CreateTransferBody = z.infer<typeof createTransferBodySchema>;

// Schema for FormData fields
export const lanTransferBodySchema = z.object({
  fileListBuffer: z.any(),
  transferFormBuffer: z.any(),
  fileMetadataV2: z.record(z.array(fileMetadataZodSchema)),
  deletedFolders: z.array(z.string()),
  changedFolderPaths: z.array(
    z.object({
      original: z.string(),
      new: z.string(),
    })
  ),
  changesJustification: z.string(),
  folderBuffers: z.record(
    z.array(
      z.object({
        filename: z.string(),
        path: z.string(),
        buffer: z.any(),
      })
    )
  ),
  application: z.string(),
  accession: z.string(),
});

// TypeScript type inferred from Zod schema
export type LanTransferBody = z.infer<typeof lanTransferBodySchema>;
