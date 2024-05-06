import { model, Schema, Model, Document } from "mongoose";

import { IDigitalFile } from "./interfaces/IDigitalFile";

const DigitalFileSchema: Schema = new Schema<IDigitalFile>({
  checksum_MD5: { type: String },
  checksum_SHA_1: { type: String },
  checksum_SHA_256: { type: String },
  checksum_SHA_512: { type: String },
  fileName: { type: String },
  objectCreateDate: { type: Date },
  lastModifiedDate: { type: Date },
  lastAccessDate: { type: Date },
  lastSaveDate: { type: Date },
  lastSaveBy: { type: String },
  authors: { type: String },
  owners: { type: String },
  compagny: { type: String },
  computer: { type: String },
  contenType: { type: String },
  programType: { type: String },
  size: { type: String },
  version: { type: String },
  createDate: { type: Date },
  updatedDate: { type: Date },
  createdBy: { type: String },
  updatedBy: { type: String },
  description: { type: String },
  fileId: { type: String },
  digitalFileList: {
    type: Schema.Types.ObjectId,
    ref: "DigitalFileList",
  },
  digitalObject: [
    {
      type: Schema.Types.Mixed,
      ref: "DigitalObject",
    },
  ],
  timestamps: { createDate: Date, updatedDate: Date },
});

export const DigitalFileModel: Model<IDigitalFile> = model<IDigitalFile>(
  "DigitalFile",
  DigitalFileSchema
);
export { IDigitalFile };
