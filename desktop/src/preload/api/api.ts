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
  onAppCloseRequested: (callback: () => void) => {
    ipcRenderer.on("app-close-requested", callback);
  },
  forceQuitApp: () => ipcRenderer.invoke("force-quit-app"),
};
