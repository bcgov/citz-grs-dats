export interface IFolderInformation {
    path: string;
    schedule: string;
    primarySecondary: string;
    opr: boolean;
    startDate: Date | null;
    endDate: Date | null;
    soDate: Date | null;
    fdDate: Date | null;
    fileId: string;
    files: IFileInformation[];
  }

  export interface IFileInformation
  {
    path: string;
    checksum: string;
    dateCreated: string;
    dateModified: string;
    dateAccessed: string;
    dateLastSaved: string;
    programName: string;
    owner: string;
    computer: string;
    contentType: string;
    sizeInBytes: Number;
    company: string;
    revisionNumber: string;
    fileId: string;
    name:string;


  }