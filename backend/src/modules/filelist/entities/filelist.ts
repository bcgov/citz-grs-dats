import { Schema, model, type InferSchemaType } from "mongoose";
import { z } from "zod";
import {
	fileMetadataSchema,
	fileMetadataZodSchema,
	folderMetadataSchema,
	folderMetadataZodSchema,
} from "../schemas";

// Mongoose Schema
const fileListSchema = new Schema({
	jobID: { type: String, required: true },
	createdOn: { type: String, required: false, default: () => new Date().toDateString() },
	outputFileType: { type: String, required: true },
	metadata: {
		admin: {
			application: { type: String, default: "N/A" },
			accession: { type: String, default: "N/A" },
			submittedBy: {
				name: { type: String, required: true },
				email: { type: String, required: true },
			},
		},
		folders: { type: Map, of: folderMetadataSchema, required: true }, // Record<string, folderMetadataSchema>
		files: { type: Map, of: [fileMetadataSchema], required: true }, // Record<string, fileMetadataSchema[]>
	},
});

// Mongoose Model
export const FileListModel = model("FileList", fileListSchema);

// Zod Schema
export const fileListZodSchema = z.object({
	jobID: z.string(),
	createdOn: z.string().optional(),
	outputFileType: z.string(),
	metadata: z.object({
		admin: z.object({
			application: z.string().optional(),
			accession: z.string().optional(),
			submittedBy: z.object({
				name: z.string(),
				email: z.string(),
			}),
		}),
		folders: z.record(folderMetadataZodSchema),
		files: z.record(z.array(fileMetadataZodSchema)),
	}),
});

// TypeScript Types
export type FileListMongoose = InferSchemaType<typeof fileListSchema>;
export type FileListZod = z.infer<typeof fileListZodSchema>;
