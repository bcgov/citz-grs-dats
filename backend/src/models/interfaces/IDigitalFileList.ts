import { Document, Schema, Types } from "mongoose";

export interface IDigitalFileList extends Document {
  primarySecondary?: string;
  schedule?: string;
  description?: string;
  fileId?: string;
  folder: string;
  folderSend?: string;
  fileTitle?: string;
  isOPR?: boolean;
  startDate?: Date;
  endtDate?: Date;
  soDate?: Date;
  finalDispositionDate?: Date;
  createDate?: Date;
  updatedDate?: Date;
  transfer: {
    type: Schema.Types.ObjectId;
    ref: "Transfer";
  };
  fileCount?: Number;
  size?: Number;

  createdBy?: string;
  updatedBy?: string;
  timestamps?: {};
  note?: string;
}
