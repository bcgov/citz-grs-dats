import { z } from "zod";

// Admin Metadata Zod Schema
export const adminMetadataZodSchema = z.object({
	ministry: z.union([z.string(), z.null()]).optional(),
	branch: z.union([z.string(), z.null()]).optional(),
	accession: z.string(),
	application: z.string(),
});

export type AdminMetadataZodType = z.infer<typeof adminMetadataZodSchema>;
