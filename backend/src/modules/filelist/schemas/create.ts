import { z } from "zod";
import { fileMetadataZodSchema, folderMetadataZodSchema } from "./metadata";

export const createFileListBodySchema = z.object({
	outputFileType: z.string(),
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
});

// TypeScript Type inferred from Zod Schema
export type CreateFileListBody = z.infer<typeof createFileListBodySchema>;
