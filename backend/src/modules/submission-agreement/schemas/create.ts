import { z } from "zod";

export const createSubmissionAgreementBodySchema = z.object({
	application: z.string(),
	accession: z.string(),
});

// TypeScript Type inferred from Zod Schema
export type CreateSubmissionAgreementBody = z.infer<typeof createSubmissionAgreementBodySchema>;
