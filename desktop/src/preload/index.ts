import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { checkApiStatus, checkIpRange, fetchProtectedRoute, getUser, safePromise } from "./api";

const api = {
	versions: process.versions,
	checkApiStatus,
	checkIpRange,
	getCurrentApiUrl: () => ipcRenderer.invoke("get-current-api-url"),
	startLoginProcess: () => ipcRenderer.invoke("start-login-process"),
	logout: (idToken: string | undefined) => ipcRenderer.invoke("start-logout-process", idToken),
	getUser,
	safePromise,
	fetchProtectedRoute,
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
