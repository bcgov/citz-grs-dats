type FileBufferObj = {
  filename: string;
  path: string;
  filePath: string;
  size: number;
};

type EdrmsFiles = {
  dataport?: File;
  fileList?: File;
  transferForm?: File;
};

type MetadataCacheEntry = {
  sourcePath: string;
  originalSource?: string;
  totalFileCount?: number;
  processedCount?: number;
};

type LanTransferSession = {
  type: "lan";
  currentViewIndex: number;
  accession: string;
  application: string;
  confirmAccAppChecked: boolean;
  submissionAgreementAccepted: boolean;
  fileListPath: string | null;
  fileListFilename: string | null;
  transferFormPath: string | null;
  transferFormFilename: string | null;
  changes: Array<{
    originalFolderPath: string;
    newFolderPath?: string;
    deleted: boolean;
  }>;
  changesJustification: string;
  foldersMetadata: Record<string, unknown>;
};

type EdrmsTransferSession = {
  type: "edrms";
  currentViewIndex: number;
  accession: string;
  application: string;
  confirmAccAppChecked: boolean;
  submissionAgreementAccepted: boolean;
  folderPath: string | null;
  dataportPath: string | null;
  dataportFilename: string | null;
  fileListPath: string | null;
  fileListFilename: string | null;
  transferFormPath: string | null;
  transferFormFilename: string | null;
};

type TransferSession = LanTransferSession | EdrmsTransferSession;

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
    getProcessingConfig: () => Promise<{
      highWaterMark: number;
      concurrency: number;
      hashAlgorithms: string[];
      checksumMode: string;
      fingerprintSize: number;
    }>;
    setProcessingConfig: (config: Record<string, unknown>) => Promise<{
      highWaterMark: number;
      concurrency: number;
      hashAlgorithms: string[];
      checksumMode: string;
      fingerprintSize: number;
    }>;
    deleteMetadataState: (folderPath: string) => Promise<void>;
    deleteCopyState: (folderPath: string) => Promise<void>;
    deleteTempDir: (tempDir: string) => Promise<boolean>;
    saveTransferSession: (type: string, data: Record<string, unknown>) => Promise<void>;
    loadTransferSession: (type: string) => Promise<TransferSession | null>;
    deleteTransferSession: (type: string) => Promise<void>;
    readFileFromPath: (filePath: string) => Promise<{ data: Uint8Array; filename: string }>;
    getMetadataCacheEntries: () => Promise<MetadataCacheEntry[]>;
    onOpenConfigureProcessing: (callback: () => void) => void;
  };
}
