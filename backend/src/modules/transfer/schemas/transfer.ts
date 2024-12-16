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
