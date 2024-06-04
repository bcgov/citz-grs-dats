import { TransferStatus as status } from "../../Enums/TransferStatus";

export default interface ITransferDTO {
  _id: string;
  accessionNumber: string;
  applicationNumber: string;
  description?: string;
  transferStatus?: status;
  producerMinistry?: string;
  producerBranch?: string;
  isNew?: boolean;
  digitalFileLists?: string[];
  createDate?: Date;
  updatedDate?: Date;
  createdBy?: string;
  updatedBy?: string;
  timestamps?: {};
}
