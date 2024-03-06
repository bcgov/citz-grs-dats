import { Document, Schema, Types } from "mongoose";

export interface IDigitalObject extends Document {
  title: String;
  description: String;
  data: Buffer; // This is the field for storing binary data (BLOB)
  contentType: String; // You can also store the content type, e.g., 'image/jpeg', 'application/pdf', etc.
  digitalFileList: {
    type: Schema.Types.ObjectId;
    ref: "DigitalFileList";
  };
  createDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;
}
