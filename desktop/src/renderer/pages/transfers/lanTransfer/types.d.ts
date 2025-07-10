export type Folder = {
  id: number;
  folder: string;
  invalidPath: boolean;
  bufferProgress: number;
  metadataProgress: number;
};

export type FolderUploadChange = {
  originalFolderPath: string;
  newFolderPath?: string;
  deleted: boolean;
};

export type FileBufferObj = {
  filename: string;
  path: string;
  buffer: Buffer;
};

export type RunningWorker = {
  id?: string | null;
  type: "metadata" | "buffer";
  folder: string;
};
