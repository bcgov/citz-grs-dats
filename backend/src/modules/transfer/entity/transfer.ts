import { Schema, model, type InferSchemaType } from "mongoose";
import { z } from "zod";

// Mongoose Schema
const transferSchema = new Schema({
	createdOn: { type: String, required: false, default: () => new Date().toDateString() },
	metadata: {
		admin: {
			application: { type: String, required: true },
			accession: { type: String, required: true },
			submittedBy: {
				name: { type: String, required: true },
				email: { type: String, required: true },
			},
		},
		folders: { type: Schema.Types.Mixed, required: true },
		files: { type: Schema.Types.Mixed, required: true },
	},
});

// Mongoose Model
export const TransferModel = model("FileList", transferSchema);

// Zod Schema
export const transferZodSchema = z.object({
	createdOn: z.string().optional(),
	outputFileType: z.string(),
	metadata: z.object({
		admin: z.object({
			application: z.string(),
			accession: z.string(),
			submittedBy: z.object({
				name: z.string(),
				email: z.string(),
			}),
		}),
		folders: z.any(),
		files: z.any(),
	}),
});

// TypeScript Types
export type TransferMongoose = InferSchemaType<typeof transferSchema>;
export type TransferZod = z.infer<typeof transferZodSchema>;
