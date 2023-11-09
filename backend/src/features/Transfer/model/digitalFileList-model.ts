import { model, Schema, Model, Document } from "mongoose";
import { IDigitalFileList } from "dats_shared/Types//interfaces/IDigitalFileList";

const DigitalFileListSchema: Schema = new Schema<IDigitalFileList>({
  primarySecondary: { type: String, required: true },
  schedule: { type: String, required: true },
  description: { type: String, required: false },
  fileId: { type: String, required: false },
  folder: { type: String, required: true },
  fileTitle: { type: String, required: true },
  transfer: {
    type: Schema.Types.ObjectId,
    ref: "Transfer",
  },
  digitalFiles: [
    {
      type: Schema.Types.ObjectId,
      ref: "DigitalFile",
    },
  ],
  isOPR: { type: Boolean, required: true },
  startDate: { type: Date },
  endtDate: { type: Date },
  finalDispositionDate: { type: Date },
  soDate: { type: Date },
  createDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  createdBy: { type: String, required: false },
  updatedBy: { type: String, required: false },
  timestamps: { createDate: Date, updatedDate: Date },
});

export const DigitalFileListModel: Model<IDigitalFileList> =
  model<IDigitalFileList>("DigitalFileList", DigitalFileListSchema);
export { IDigitalFileList };
