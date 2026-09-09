import { ipcRenderer } from "electron";

export const getFolderMetadata = async ({
  filePath,
}: {
  filePath: string;
}): Promise<{ workerId?: string; success: boolean; error?: unknown }> => {
  try {
    // Invoke the IPC call and get the workerId
    const response = await ipcRenderer.invoke("get-folder-metadata", {
      filePath,
    });

    if (!response.success) {
      console.error("Failed to start worker:", response.error);
      return { success: false, error: response.error };
    }

    const workerId = response.workerId;
    console.log(`Metadata Worker started with ID: ${workerId}`);

    // Store the worker ID in sessionStorage (optional, for later retrieval)
    sessionStorage.setItem("activeMetadataWorkerId", workerId);

    // Continue listening to events
    ipcRenderer.on(
      "folder-metadata-progress",
      (_, data: { progressPercentage: number; source: string; fileProcessed?: string; currentFileIndex?: number; totalFiles?: number }) => {
        window.dispatchEvent(
          new CustomEvent("folder-metadata-progress", { detail: data })
        );
      }
    );

    ipcRenderer.on(
      "folder-metadata-missing-path",
      (_, data: { path: string }) => {
        window.dispatchEvent(
          new CustomEvent("folder-metadata-missing-path", { detail: data })
        );
      }
    );

    ipcRenderer.on(
      "folder-metadata-empty-folder",
      (_, data: { path: string }) => {
        window.dispatchEvent(
          new CustomEvent("folder-metadata-empty-folder", { detail: data })
        );
      }
    );

    ipcRenderer.on(
      "folder-metadata-paused",
      (
        _,
        data: {
          source: string;
          error?: string;
          processedFileCount?: number;
          totalFileCount?: number;
        }
      ) => {
        window.dispatchEvent(
          new CustomEvent("folder-metadata-paused", { detail: data })
        );
      }
    );

    ipcRenderer.on(
      "folder-metadata-status",
      (_, data: { source: string; message: string }) => {
        window.dispatchEvent(
          new CustomEvent("folder-metadata-status", { detail: data })
        );
      }
    );

    ipcRenderer.on(
      "folder-metadata-resumed",
      (_, data: { source: string }) => {
        window.dispatchEvent(
          new CustomEvent("folder-metadata-resumed", { detail: data })
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
          fileCount?: number;
          error?: unknown;
        }
      ) => {
        window.dispatchEvent(
          new CustomEvent("folder-metadata-completion", { detail: data })
        );
      }
    );

    return { workerId, success: true };
  } catch (error) {
    console.error("Error in getFolderMetadata:", error);
    return { success: false, error };
  }
};
