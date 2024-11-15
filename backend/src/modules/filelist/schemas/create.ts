import { z } from "zod";

export const createFileListBodySchema = z.object({
	application: z.string().optional(),
	accession: z.string().optional(),
	outputFileType: z.string(),
	metadata: z.any(),
});

// TypeScript Type inferred from Zod Schema
export type CreateFileListBody = z.infer<typeof createFileListBodySchema>;
