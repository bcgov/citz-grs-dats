import type {
  SSOUser,
  IdirIdentityProvider,
} from "@bcgov/citz-imb-sso-js-core";
import type { ElectronAPI } from "@electron-toolkit/preload";

type FileBufferObj = {
  filename: string;
  path: string;
  buffer: Buffer;
};

declare global {
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
      };

      transfer: {
        parseXlsxFileList: (fileList: File | null | undefined) => Promise<{
          accession: string;
          application: string;
          folders: string[];
        } | null>;
        createZipBuffer: (
          folders: Record<string, FileBufferObj[]>
        ) => Promise<Buffer>;
      };

      workers: {
        getFolderMetadata: ({
          filePath,
        }: {
          filePath: string;
        }) => Promise<void>;
        getFolderBuffer: ({ filePath }: { filePath: string }) => Promise<void>;
      };
    };
  }
}
