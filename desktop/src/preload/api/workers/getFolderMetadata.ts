import { ipcRenderer } from "electron";

export const getFolderMetadata = ({ filePath }: { filePath: string }) => {
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
    "folder-metadata-empty-folder",
    (_, data: { path: string }) => {
      window.dispatchEvent(
        new CustomEvent("folder-metadata-empty-folder", {
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
}
