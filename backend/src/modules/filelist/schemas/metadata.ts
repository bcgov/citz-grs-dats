import { Schema } from "mongoose";
import { z } from "zod";

// Folder Metadata Schema
export const folderMetadataSchema = new Schema(
	{
		schedule: { type: String, required: false },
		classification: { type: String, required: false },
		file: { type: String, required: false },
		opr: { type: Boolean, required: false },
		startDate: { type: String, required: false },
		endDate: { type: String, required: false },
		soDate: { type: String, required: false },
		fdDate: { type: String, required: false },
	},
	{ _id: false }, // Prevents Mongoose from automatically creating an _id for each folder
);

// Folder Metadata Zod Schema
export const folderMetadataZodSchema = z.object({
	schedule: z.union([z.string(), z.null()]).optional(),
	classification: z.union([z.string(), z.null()]).optional(),
	file: z.union([z.string(), z.null()]).optional(),
	opr: z.union([z.boolean(), z.null()]).optional(),
	startDate: z.union([z.string(), z.null()]).optional(),
	endDate: z.union([z.string(), z.null()]).optional(),
	soDate: z.union([z.string(), z.null()]).optional(),
	fdDate: z.union([z.string(), z.null()]).optional(),
});

export type FolderMetadataZodType = z.infer<typeof folderMetadataZodSchema>;

// File Metadata Schema
export const fileMetadataSchema = new Schema(
	{
		filepath: { type: String, required: true },
		filename: { type: String, required: true },
		size: { type: String, required: true },
		birthtime: { type: String, required: true },
		lastModified: { type: String, required: true },
		lastAccessed: { type: String, required: true },
		checksum: { type: String, required: true },
	},
	{ _id: false }, // Prevents Mongoose from automatically creating an _id for each folder
);

// File Metadata Zod Schema
export const fileMetadataZodSchema = z.object({
	filepath: z.string(),
	filename: z.string(),
	size: z.string(),
	birthtime: z.string(),
	lastModified: z.string(),
	lastAccessed: z.string(),
	checksum: z.string(),
});

export type FileMetadataZodType = z.infer<typeof fileMetadataZodSchema>;
