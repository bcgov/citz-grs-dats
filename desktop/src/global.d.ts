type FileBufferObj = {
  filename: string;
  path: string;
  buffer: Buffer;
};

type EdrmsFiles = {
  dataport?: File;
  fileList?: File;
  transferForm?: File;
};

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
      refreshTokens: () => Promise<{
        accessToken: string;
        refreshToken: string;
        idToken: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
      }>;
    };

    utils: {
      safePromise: (
        promise: Promise
      ) => Promise<[Error, null] | [null, ExtendedResponse]>;
      fileToBuffer: (file: File) => Promise<Buffer>;
      isEmptyFolder: (filePath: string) => boolean;
    };

    transfer: {
      parseXlsxFileList: (fileList: File | null | undefined) => Promise<{
        accession: string;
        application: string;
        folders: string[];
        foldersMetadata: Record<string, unknown>;
      }>;
      createZippedChunks: (
        folders: Record<string, FileBufferObj[]>
      ) => Readable;
      createChecksumHasher: () => {
        update: (chunk: Uint8Array | Buffer) => void;
        digest: () => string;
      };
      createBufferUtils: () => {
        from: (data: ArrayBuffer | Uint8Array | number[]) => Buffer;
        isBuffer: (value: unknown) => value is Buffer;
        normalize: (input: unknown) => Buffer;
      };
      accessionExists: (accession?: string) => boolean;
      isAccessionValid: (accession?: string) => boolean;
      applicationExists: (application?: string) => boolean;
      isApplicationValid: (application?: string) => boolean;
      parseEdrmsFiles: (folderPath: string) => Promise<EdrmsFiles>;
      parseTabDelimitedTxt: (file: File) => Promise<Record<string, string>[]>;
      parseDataportJsonMetadata: (
        items: Record<string, string>[],
        folderPath: string
      ) => Promise<{
        admin: {
          accession: string;
          application: string;
        };
        folders: Record<string, unknown>;
        files: Record<string, unknown[]>;
      }>;
    };

    workers: {
      getFolderMetadata: ({ filePath }: { filePath: string }) => Promise<{
        workerId?: string | null;
        success: boolean;
        error?: unknown;
      }>;
      getFolderBuffer: ({ filePath }: { filePath: string }) => Promise<{
        workerId?: string | null;
        success: boolean;
        error?: unknown;
      }>;
      shutdownById: (id: string) => Promise<void>;
      shutdown: () => Promise<void>;
    };

    onAppCloseRequested: (callback: () => void) => void;
    forceQuitApp: () => Promise<unknown>;
    getReleaseNotes: () => Promise<Record<string, string>>;
    getCurrentAppVersion: () => Promise<string>;
    updateViewedReleaseVersion: () => Promise<void>;
  };
}
