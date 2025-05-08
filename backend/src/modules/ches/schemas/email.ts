import { z } from "zod";

// AttachmentObject Schema
const AttachmentObjectSchema = z.object({
  content: z.any(),
  contentType: z.string(),
  encoding: z.string().optional(),
  filename: z.string(),
});

// EmailRequestBodySchema
export const EmailDataSchema = z.object({
  attachments: z.array(AttachmentObjectSchema).optional(),
  bcc: z.array(z.string()).optional(),
  bodyType: z.enum(["html", "text"]).optional(),
  body: z.string(),
  cc: z.array(z.string()).optional(),
  from: z.string().optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  subject: z.string(),
  to: z.array(z.string()),
  delayTS: z.number().optional(),
});

// TypeScript type inferred from the schema
export type EmailData = z.infer<typeof EmailDataSchema>;
