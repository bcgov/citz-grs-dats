import { Types } from "mongoose";
// import { TransferStatus as status } from "dats_shared/Types/Enums/TransferStatus";

export interface ITransfer {
  _id: Types.ObjectId;
  accessionNumber: string;
  applicationNumber: string;
  description?: string;
  transferStatus: string;
  // typeOfService: TypeOfServiceEnum;
  // typeOfS?chedule: typeOfScheduleEnum;
  // descriptionOfRecords?: String;
  // agentLastName?: String; // Agent and Producer informations
  // agentFirstName?: String;
  // agentEmail?: String;
  // producerOfficeName?: String;
  producerMinistry?: String;
  producerBranch?: String;
  // producerOfficeAddress?: String;
  // producerOfficeCity?: String;
  // producerOfficePostalCode?: String;
  digitalFileLists?: [
    {
      type: Types.ObjectId;
      ref: "DigitalFileList";
    }
  ];
  createDate?: Date;
  updatedDate?: Date;
  createdBy?: string;
  updatedBy?: string;
  timestamps?: {};
}
