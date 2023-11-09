export default interface ITransferFormData {
  accessionNumber: string;
  applicationNumber: string;
  description: string;
  status: string;
  scheduleNumber: string;
  descriptionOfRecords: string;
  agentLastName: string;
  agentFirstName: string;
  agentEmail: string;
  producerOfficeName: string;
  producerMinistry: string;
  producerBranch: string;
  producerOfficeAddress: string;
  producerOfficeCity: string;
  producerOfficePostalCode: string;
  digitalFileLists?: any[]; // You can use an empty array or set a default value as needed
  createDate?: Date; // You can set a default date if needed
  updatedDate?: Date; // You can set a default date if needed
  createdBy?: string;
  updatedBy?: string;
  timestamps?: {};
}
