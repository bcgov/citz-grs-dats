import { z } from "zod";

export const createTransferBodySchema = z.object({
	buffer: z.instanceof(Buffer),
	application: z.string().optional(),
	accession: z.string().optional(),
});

// TypeScript Type inferred from Zod Schema
export type CreateTransferBody = z.infer<typeof createTransferBodySchema>;
