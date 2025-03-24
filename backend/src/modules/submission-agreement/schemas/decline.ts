import { z } from "zod";

export const declineSubmissionAgreementBodySchema = z.object({
  application: z.string(),
  accession: z.string(),
});

// TypeScript Type inferred from Zod Schema
export type DeclineSubmissionAgreementBody = z.infer<
  typeof declineSubmissionAgreementBodySchema
>;
