import { Document, Schema, ObjectId } from "mongoose";

export interface IDigitalFile extends Document {
  checksum_MD5: string;
  checksum_SHA_1: string;
  checksum_SHA_256: string;
  checksum_SHA_512: string;
  fileName: string;
  objectCreateDate: Date;
  lastModifiedDate: Date;
  lastAccessDate: Date;
  lastSaveDate: Date;
  lastSaveBy: string;
  authors: string;
  owners: string;
  compagny: string;
  computer: string;
  contenType: string;
  programType: string;
  size: string;
  version: string;
  createDate: Date;
  updatedDate: Date;
  createdBy: string;
  updatedBy: string;
  description: string;
  fileId: string;
  digitalFileList: {
    type: Schema.Types.ObjectId;
    ref: "DigitalFileList";
  };
  digitalObject: [
    {
      type: Schema.Types.ObjectId;
      ref: "DigitalObject";
    }
  ];
  timestamps?: {};
}
