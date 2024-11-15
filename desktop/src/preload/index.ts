import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { checkApiStatus, checkIpRange } from "./api";
import { safePromise } from "./api/utils";
import { fetchProtectedRoute, getUser } from "./api/sso";

const api = {
	versions: process.versions,
	checkApiStatus,
	checkIpRange,
	getCurrentApiUrl: () => ipcRenderer.invoke("get-current-api-url"),
	sso: {
		getUser,
		fetchProtectedRoute,
		startLoginProcess: () => ipcRenderer.invoke("start-login-process"),
		logout: (idToken: string | undefined) => ipcRenderer.invoke("start-logout-process", idToken),
	},
	utils: {
		safePromise,
	},
	workers: {
		copyFolderAndMetadata: ({ filePath, transfer }: { filePath: string; transfer: string }) =>
			ipcRenderer.invoke("copy-folder-and-metadata", { filePath, transfer }),
		getFolderMetadata: ({ filePath }: { filePath: string }) =>
			ipcRenderer.invoke("get-folder-metadata", { filePath }),
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
