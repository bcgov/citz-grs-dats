interface Window {
  electron: ElectronAPI;
  api: {
    versions: NodeJS.Process.Versions;
    checkApiStatus: (url: string) => Promise<boolean>;
    checkIpRange: () => Promise<boolean>;
    getCurrentApiUrl: () => Promise<string>;
    selectDirectory: ({
      singleSelection,
    }?: {
      singleSelection?: boolean;
    }) => Promise<string[]>;

    sso: {
      startLoginProcess: () => Promise<void>;
      logout: (idToken: string | undefined) => Promise<void>;
      getUser: (
        accessToken: string | undefined
      ) => SSOUser<IdirIdentityProvider> | undefined;
      fetchProtectedRoute: (
        url: string,
        accessToken: string | undefined,
        options: RequestInit = {}
      ) => Promise<[Error, null] | [null, ExtendedResponse]>;
    };

    utils: {
      safePromise: (
        promise: Promise
      ) => Promise<[Error, null] | [null, ExtendedResponse]>;
      fileToBuffer: (file: File) => Promise<Buffer>;
    };

    transfer: {
      parseXlsxFileList: (fileList: File | null | undefined) => Promise<{
        accession: string;
        application: string;
        folders: string[];
      }>;
      createZipBuffer: (
        folders: Record<string, FileBufferObj[]>
      ) => Promise<Buffer>;
      accessionExists: (accession?: string) => boolean;
      isAccessionValid: (accession?: string) => boolean;
      applicationExists: (application?: string) => boolean;
      isApplicationValid: (application?: string) => boolean;
    };

    workers: {
      getFolderMetadata: ({ filePath }: { filePath: string }) => Promise<void>;
      getFolderBuffer: ({ filePath }: { filePath: string }) => Promise<void>;
    };
  };
}
