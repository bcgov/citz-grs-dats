import { ipcRenderer } from "electron";
import { fetchProtectedRoute } from "./fetchProtectedRoute";
import { getUser } from "./getUser";

export default {
  getUser,
  fetchProtectedRoute,
  startLoginProcess: () => ipcRenderer.invoke("start-login-process"),
  logout: (idToken: string | undefined) =>
    ipcRenderer.invoke("start-logout-process", idToken),
  refreshTokens: () => ipcRenderer.invoke("refresh-tokens"),
};
