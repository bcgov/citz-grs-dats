import { z } from "zod";

export const createFileListBodySchema = z.object({
	outputFileType: z.string(),
	metadata: z.object({
		admin: z
			.object({
				application: z.string().optional(),
				accession: z.string().optional(),
			})
			.optional(),
		folders: z.any(),
		files: z.any(),
	}),
});

// TypeScript Type inferred from Zod Schema
export type CreateFileListBody = z.infer<typeof createFileListBodySchema>;
