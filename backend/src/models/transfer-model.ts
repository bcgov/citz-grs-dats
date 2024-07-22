import { model, Schema, Model, Document } from "mongoose";

import { ITransfer } from "./interfaces/ITransfer";
import { TransferStatus as status } from "./enums/TransferStatus";
import { DigitalFileListModel } from './digitalFileList-model';
import { PspModel } from './psp-model';

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
  psps: [
    {
      type: Schema.Types.ObjectId,
      ref: "Psp",
    }
  ],
  producerMinistry: { type: String, required: false },
  producerBranch: { type: String, required: false },
  createDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  createdBy: { type: String, required: false },
  updatedBy: { type: String, required: false },
  timestamps: { createDate: Date, updatedDate: Date },
});




TransferSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    // Delete associated digital file lists
    if (Array.isArray(doc.digitalFileLists)) {
      for (const digitalFileListId of doc.digitalFileLists) {
        await DigitalFileListModel.deleteOne({ _id: digitalFileListId });
      }
    }
    // Delete associated PSPs
    if (Array.isArray(doc.psps)) {
      for (const pspId of doc.psps) {
        await PspModel.deleteOne({ _id: pspId });
      }
    }
  }
});

export const TransferModel: Model<ITransfer> = model<ITransfer>(
  "transfer",
  TransferSchema
);
export { ITransfer };
