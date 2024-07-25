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
  transfer: string;
  digitalFiles?: IDigitalFileDTO[];
  createdBy?: string;
  updatedBy?: string;
  fileCount: Number;
  size: Number;
  timestamps?: {};
  note?: string;
}

export interface IDigitalFileDTO {
  checksum_SHA_256: string
  filePath: string
  fileName: string
  objectCreateDate: string
  lastModifiedDate: string
  lastAccessDate: string
  authors: string
  owners: string
  company: string
  computer: string
  contenType: string
  programType: string
  size: string
  version: string
  digitalFileList: string
  digitalObject: string[]
  _id: string
}
