import { z } from "zod";

// Admin Metadata Zod Schema
export const adminMetadataZodSchema = z.object({
	accession: z.string(),
	application: z.string(),
});

export type AdminMetadataZodType = z.infer<typeof adminMetadataZodSchema>;
