import { Schema, model, type InferSchemaType } from "mongoose";
import { z } from "zod";

// Mongoose Schema
const fileListSchema = new Schema({
	jobID: { type: String, required: true },
	createdOn: { type: String, required: false, default: () => new Date().toDateString() },
	submittedBy: {
		name: { type: String, required: true },
		email: { type: String, required: true },
	},
	transfer: {
		application: { type: String, default: "N/A" },
		accession: { type: String, default: "N/A" },
	},
	outputFileType: { type: String, required: true },
	metadata: { type: Schema.Types.Mixed, required: true },
});

// Mongoose Model
export const FileListModel = model("FileList", fileListSchema);

// Zod Schema
export const fileListZodSchema = z.object({
	jobID: z.string(),
	createdOn: z.string().optional(),
	submittedBy: z.object({
		name: z.string(),
		email: z.string(),
	}),
	transfer: z.object({
		application: z.string().default("N/A"),
		accession: z.string().default("N/A"),
	}),
	outputFileType: z.string(),
	metadata: z.any(),
});

// TypeScript Types
export type FileListMongoose = InferSchemaType<typeof fileListSchema>;
export type FileListZod = z.infer<typeof fileListZodSchema>;
