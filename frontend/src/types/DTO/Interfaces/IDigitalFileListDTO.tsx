export interface IDigitalFileListDTO {
  _id: string;
  primarySecondary?: string;
  schedule?: string;
  description?: string;
  fileId?: string;
  folder: string;
  fileTitle?: string;
  isOPR?: boolean;
  startDate?: Date;
  endtDate?: Date;
  soDate?: Date;
  finalDispositionDate?: Date;
  createDate?: Date;
  updatedDate?: Date;
  transfer: any[];
  digitalFiles?: any[];
  createdBy?: string;
  updatedBy?: string;
  timestamps?: {};
}
