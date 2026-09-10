import { ipcRenderer } from "electron";
import { checkApiStatus } from "./checkAPIStatus";
import { checkIpRange } from "./checkIPRange";
import sso from "./sso";
import transfer from "./transfer";
import utils from "./utils";
import workers from "./workers";

export const api = {
  versions: process.versions,
  checkApiStatus,
  checkIpRange,
  getCurrentApiUrl: () => ipcRenderer.invoke("get-current-api-url"),
  selectDirectory: ({ singleSelection }: { singleSelection?: boolean } = {}) =>
    ipcRenderer.invoke("select-directory", { singleSelection }),
  sso,
  utils,
  transfer,
  workers,
  getProcessingConfig: () => ipcRenderer.invoke("get-processing-config"),
  setProcessingConfig: (config: Record<string, unknown>) =>
    ipcRenderer.invoke("set-processing-config", config),
  deleteMetadataState: (folderPath: string) =>
    ipcRenderer.invoke("delete-metadata-state", folderPath),
  deleteCopyState: (folderPath: string) =>
    ipcRenderer.invoke("delete-copy-state", folderPath),
  deleteTempDir: (tempDir: string) =>
    ipcRenderer.invoke("delete-temp-dir", tempDir),
  saveTransferSession: (type: string, data: Record<string, unknown>) =>
    ipcRenderer.invoke("save-transfer-session", { type, data }),
  loadTransferSession: (type: string) =>
    ipcRenderer.invoke("load-transfer-session", type),
  deleteTransferSession: (type: string) =>
    ipcRenderer.invoke("delete-transfer-session", type),
  readFileFromPath: (filePath: string): Promise<{ data: Uint8Array; filename: string }> =>
    ipcRenderer.invoke("read-file-from-path", filePath),
  getMetadataCacheEntries: () =>
    ipcRenderer.invoke("get-metadata-cache-entries"),
  onOpenConfigureProcessing: (callback: () => void) => {
    ipcRenderer.on("open-configure-processing", callback);
  },
  onAppCloseRequested: (callback: () => void) => {
    ipcRenderer.on("app-close-requested", callback);
  },
  forceQuitApp: () => ipcRenderer.invoke("force-quit-app"),
  getReleaseNotes: () => ipcRenderer.invoke("get-release-notes"),
  getCurrentAppVersion: () => ipcRenderer.invoke("get-current-app-version"),
  updateViewedReleaseVersion: () =>
    ipcRenderer.invoke("update-viewed-release-version"),
};
