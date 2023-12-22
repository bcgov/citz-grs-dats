import { model, Schema, Model, Document } from "mongoose";

import { ITransfer } from "dats_shared/Types/interfaces/ITransfer";
import { TransferStatus as status } from "dats_shared/Types/Enums/TransferStatus";

const TransferSchema: Schema = new Schema<ITransfer>({
  accessionNumber: { type: String, required: true },
  applicationNumber: { type: String, required: true },
  description: { type: String, required: false },
  descriptionOfRecords: { type: String, required: false },
  status: {
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
  agentLastName: { type: String, required: false },
  agentFirstName: { type: String, required: false },
  agentEmail: { type: String, required: false },
  producerOfficeName: { type: String, required: false },
  producerMinistry: { type: String, required: false },
  producerBranch: { type: String, required: false },
  producerOfficeAddress: { type: String, required: false },
  producerOfficeCity: { type: String, required: false },
  producerOfficePostalCode: { type: String, required: false },
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
