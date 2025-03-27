import { ipcRenderer } from "electron";

type FileBufferObj = {
  filename: string;
  path: string;
  buffer: Buffer;
};

export const getFolderBuffer = async ({
  filePath,
}: {
  filePath: string;
}): Promise<{ workerId?: string; success: boolean; error?: unknown }> => {
  try {
    // Invoke the IPC call and get the workerId
    const response = await ipcRenderer.invoke("get-folder-buffer", {
      filePath,
    });

    if (!response.success) {
      console.error("Failed to start worker:", response.error);
      return { success: false, error: response.error };
    }

    const workerId = response.workerId;
    console.log(`Worker started with ID: ${workerId}`);

    // Store the worker ID in sessionStorage (optional, for later retrieval)
    sessionStorage.setItem("activeWorkerId", workerId);

    // Continue listening to events
    ipcRenderer.on(
      "folder-buffer-progress",
      (_, data: { progressPercentage: number; source: string }) => {
        window.dispatchEvent(
          new CustomEvent("folder-buffer-progress", { detail: data })
        );
      }
    );

    ipcRenderer.on(
      "folder-buffer-missing-path",
      (_, data: { path: string }) => {
        window.dispatchEvent(
          new CustomEvent("folder-buffer-missing-path", { detail: data })
        );
      }
    );

    ipcRenderer.on(
      "folder-buffer-empty-folder",
      (_, data: { path: string }) => {
        window.dispatchEvent(
          new CustomEvent("folder-buffer-empty-folder", { detail: data })
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
          new CustomEvent("folder-buffer-completion", { detail: data })
        );
      }
    );

    return { workerId, success: true };
  } catch (error) {
    console.error("Error in getFolderBuffer:", error);
    return { success: false, error };
  }
};
