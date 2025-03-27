import { ipcRenderer } from "electron";
import { getFolderBuffer } from "./getFolderBuffer";
import { getFolderMetadata } from "./getFolderMetadata";

export default {
  getFolderMetadata,
  getFolderBuffer,
  shutdown: () => ipcRenderer.invoke("shutdown-workers"),
  shutdownById: (id: string) => ipcRenderer.invoke("shutdown-worker-by-id", id),
};
