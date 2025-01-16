import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { checkApiStatus, checkIpRange } from "./api";
import { safePromise } from "./api/utils";
import { fetchProtectedRoute, getUser } from "./api/sso";
import { parseXlsxFileList } from "./api/transfer";

const api = {
  versions: process.versions,
  checkApiStatus,
  checkIpRange,
  getCurrentApiUrl: () => ipcRenderer.invoke("get-current-api-url"),
  selectDirectory: ({ singleSelection }: { singleSelection?: boolean } = {}) =>
    ipcRenderer.invoke("select-directory", { singleSelection }),
  sso: {
    getUser,
    fetchProtectedRoute,
    startLoginProcess: () => ipcRenderer.invoke("start-login-process"),
    logout: (idToken: string | undefined) =>
      ipcRenderer.invoke("start-logout-process", idToken),
  },
  utils: {
    safePromise,
  },
  transfer: {
    parseXlsxFileList,
  },
  workers: {
    copyFolderAndMetadata: ({
      filePath,
      transfer,
    }: {
      filePath: string;
      transfer: string;
    }) =>
      ipcRenderer.invoke("copy-folder-and-metadata", { filePath, transfer }),
    getFolderMetadata: ({ filePath }: { filePath: string }) => {
      ipcRenderer.send("get-folder-metadata", { filePath });

      ipcRenderer.on(
        "folder-metadata-progress",
        (_, data: { progressPercentage: number; source: string }) => {
          window.dispatchEvent(
            new CustomEvent("folder-metadata-progress", {
              detail: data,
            })
          );
        }
      );

      ipcRenderer.on(
        "folder-metadata-missing-path",
        (_, data: { path: string }) => {
          window.dispatchEvent(
            new CustomEvent("folder-metadata-missing-path", {
              detail: data,
            })
          );
        }
      );

      ipcRenderer.on(
        "folder-metadata-completion",
        (
          _,
          data: {
            success: boolean;
            metadata?: Record<string, unknown>;
            source: string;
            error?: unknown;
          }
        ) => {
          window.dispatchEvent(
            new CustomEvent("folder-metadata-completion", {
              detail: data,
            })
          );
        }
      );
    },
  },
};

// Expose APIs to the renderer process
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
