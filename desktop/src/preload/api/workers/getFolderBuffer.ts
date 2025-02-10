import { ipcRenderer } from "electron";

type FileBufferObj = {
  filename: string;
  path: string;
  buffer: Buffer;
};

export const getFolderBuffer = ({ filePath }: { filePath: string }) => {
  ipcRenderer.send("get-folder-buffer", { filePath });

  ipcRenderer.on(
    "folder-buffer-progress",
    (_, data: { progressPercentage: number; source: string }) => {
      window.dispatchEvent(
        new CustomEvent("folder-buffer-progress", {
          detail: data,
        })
      );
    }
  );

  ipcRenderer.on(
    "folder-buffer-missing-path",
    (_, data: { path: string }) => {
      window.dispatchEvent(
        new CustomEvent("folder-buffer-missing-path", {
          detail: data,
        })
      );
    }
  );

  ipcRenderer.on(
    "folder-buffer-empty-folder",
    (_, data: { path: string }) => {
      window.dispatchEvent(
        new CustomEvent("folder-buffer-empty-folder", {
          detail: data,
        })
      );
    }
  );

  ipcRenderer.on(
    "folder-buffer-completion",
    (
      _,
      data: {
        success: boolean;
        buffers?: FileBufferObj[];
        source: string;
        error?: unknown;
      }
    ) => {
      window.dispatchEvent(
        new CustomEvent("folder-buffer-completion", {
          detail: data,
        })
      );
    }
  );
}
