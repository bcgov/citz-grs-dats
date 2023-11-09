import { Document, Schema, Types } from "mongoose";

export interface ITransfer extends Document {
  accessionNumber: string;
  applicationNumber: string;
  description: string;
  status: string;
  // typeOfService: TypeOfServiceEnum;
  // typeOfS?chedule: typeOfScheduleEnum;
  scheduleNumber: String;
  descriptionOfRecords: String;
  agentLastName: String; // Agent and Producer informations
  agentFirstName: String;
  agentEmail: String;
  producerOfficeName: String;
  producerMinistry: String;
  producerBranch: String;
  producerOfficeAddress: String;
  producerOfficeCity: String;
  producerOfficePostalCode: String;
  digitalFileLists?: [
    {
      type: Schema.Types.ObjectId;
      ref: "DigitalFileList";
    }
  ];
  createDate?: Date;
  updatedDate?: Date;
  createdBy?: string;
  updatedBy?: string;
  timestamps?: {};
}
