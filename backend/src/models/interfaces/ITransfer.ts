import { Types } from "mongoose";
// import { TransferStatus as status } from "dats_shared/Types/Enums/TransferStatus";

export interface ITransfer {
  _id?: Types.ObjectId;
  accessionNumber: string;
  applicationNumber: string;
  description?: string;
  transferStatus?: string;
  producerMinistry?: String;
  producerBranch?: String;
  digitalFileLists?: [
    {
      type: Types.ObjectId;
      ref: "DigitalFileList";
    }
  ];
  psps?: [
    {
      type: Types.ObjectId;
      ref: "Psp";
    }
  ];
  createDate?: Date;
  updatedDate?: Date;
  createdBy?: string;
  updatedBy?: string;
  timestamps?: {};
}
