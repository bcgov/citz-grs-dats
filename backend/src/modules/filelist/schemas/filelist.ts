import { z } from "zod";
import { fileMetadataZodSchema, folderMetadataZodSchema } from "./metadata";

export const jsonFileListSchema = z.object({
  admin: z.object({
    lastRevised: z.string(),
    application: z.string(),
    accession: z.string(),
  }),
  folderList: z.record(folderMetadataZodSchema),
  metadata: z.record(z.array(fileMetadataZodSchema)),
  extendedMetadata: z.record(z.any()).optional(),
});

// TypeScript Type inferred from Zod Schema
export type JsonFileList = z.infer<typeof jsonFileListSchema>;
