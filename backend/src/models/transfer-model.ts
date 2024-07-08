import { model, Schema, Model, Document } from "mongoose";

import { ITransfer } from "./interfaces/ITransfer";
import { TransferStatus as status } from "./enums/TransferStatus";

const TransferSchema: Schema = new Schema<ITransfer>({
  accessionNumber: { type: String, required: true },
  applicationNumber: { type: String, required: true },
  description: { type: String, required: false },
  transferStatus: {
    type: String,
    enum: status,
    default: status.TrIncomplete,
  },
  digitalFileLists: [
    {
      type: Schema.Types.ObjectId,
      ref: "DigitalFileList",
    },
  ],
  producerMinistry: { type: String, required: false },
  producerBranch: { type: String, required: false },
  createDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  createdBy: { type: String, required: false },
  updatedBy: { type: String, required: false },
  timestamps: { createDate: Date, updatedDate: Date },
});


// Import the DigitalFileList model
import { DigitalFileListModel } from './digitalFileList-model'; // adjust this import according to your actual file structure

TransferSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    if (Array.isArray(doc.digitalFileLists)) {
      // Delete associated digital file lists
      for (const digitalFileListId of doc.digitalFileLists) {
        await DigitalFileListModel.deleteOne({ _id: digitalFileListId });
      }
    }
  }
});

export const TransferModel: Model<ITransfer> = model<ITransfer>(
  "transfer",
  TransferSchema
);
export { ITransfer };
