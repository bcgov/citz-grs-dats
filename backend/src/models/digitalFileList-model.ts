import { model, Schema, Model, Document } from "mongoose";
import { IDigitalFileList } from "./interfaces/IDigitalFileList";

const DigitalFileListSchema: Schema = new Schema<IDigitalFileList>({
  primarySecondary: { type: String, required: false },
  schedule: { type: String, required: false },
  description: { type: String, required: false },
  fileId: { type: String, required: false },
  folder: { type: String, required: true },
  fileTitle: { type: String, required: false },
  transfer: {
    type: Schema.Types.ObjectId,
    ref: "Transfer",
  },
  isOPR: { type: Boolean, required: false },
  startDate: { type: Date },
  endtDate: { type: Date },
  finalDispositionDate: { type: Date },
  soDate: { type: Date },
  fileCount: { type: Number, required: false },
  size: { type: Number, required: false },
  createDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  createdBy: { type: String, required: false },
  updatedBy: { type: String, required: false },
  timestamps: { createDate: Date, updatedDate: Date },
});

export const DigitalFileListModel: Model<IDigitalFileList> =
  model<IDigitalFileList>("DigitalFileList", DigitalFileListSchema);
export { IDigitalFileList };
