import { TransferStatus as status } from "../../Enums/TransferStatus";

export default interface ITransferDTO {
  _id: string;
  accessionNumber: string;
  applicationNumber: string;
  description?: string;
  status?: status;
  producerMinistry?: string;
  producerBranch?: string;
  isNew?: boolean;
  digitalFileLists?: string[]; // You can use an empty array or set a default value as needed
  createDate?: Date; // You can set a default date if needed
  updatedDate?: Date; // You can set a default date if needed
  createdBy?: string;
  updatedBy?: string;
  timestamps?: {};
}
