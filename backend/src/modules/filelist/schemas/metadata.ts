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
	schedule: z.string().optional(),
	classification: z.string().optional(),
	file: z.string().optional(),
	opr: z.boolean().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	soDate: z.string().optional(),
	fdDate: z.string().optional(),
});

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
