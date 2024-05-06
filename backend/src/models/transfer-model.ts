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
    default: status.Draft,
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

export const TransferModel: Model<ITransfer> = model<ITransfer>(
  "transfer",
  TransferSchema
);
export { ITransfer };
