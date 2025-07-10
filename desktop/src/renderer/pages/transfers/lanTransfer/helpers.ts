import { parseJsonFile } from "../utils";
import type { RunningWorker } from "./types";

const api = window.api;

type ParseFileListResult = {
  accession: string;
  application: string;
  folders: string[];
  foldersMetadata: Record<string, unknown>;
}

type JsonFileList = {
  admin: { accession: string; application: string };
  folderList: Record<string, unknown>;
};

export const getFolderMetadata = async (filePath: string, setRunningWorkers: React.Dispatch<React.SetStateAction<RunningWorker[]>>) => {
  try {
    const response = await api.workers.getFolderMetadata({ filePath });

    if (response.success) {
      const workerId = response.workerId;

      // Add to runningWorkers
      setRunningWorkers((prev) => [
        ...prev,
        { id: workerId, type: "metadata", folder: filePath },
      ]);
    }
  } catch (error) {
    console.error(`Failed to fetch metadata for folder ${filePath}:`, error);
  }
};

export const getFolderBuffer = async (filePath: string, setRunningWorkers: React.Dispatch<React.SetStateAction<RunningWorker[]>>) => {
  try {
    const response = await api.workers.getFolderBuffer({ filePath });

    if (response.success) {
      const workerId = response.workerId;

      // Add to runningWorkers
      setRunningWorkers((prev) => [...prev, { id: workerId, type: "buffer", folder: filePath }]);
    }
  } catch (error) {
    console.error(`Failed to fetch buffers for folder ${filePath}:`, error);
  }
};

export const parseFileList = async (fileList: File): Promise<ParseFileListResult> => {
  let result: ParseFileListResult = {
    accession: "",
    application: "",
    folders: [],
    foldersMetadata: {},
  };

  if (!fileList) Promise.reject(new Error("Missing file list."));

  // Pull accession nad application numbers from xlsx or json file.
  const fileName = fileList.name.toLowerCase();
  const fileExtension = fileName.split(".").pop();

  switch (fileExtension) {
    case "xlsx":
      result = await api.transfer.parseXlsxFileList(fileList);
      break;

    case "json": {
      const json = await parseJsonFile(fileList) as JsonFileList;

      if (!json) return Promise.reject(new Error("Invalid JSON file format."));

      result = {
        accession: json.admin.accession,
        application: json.admin.application,
        folders: Object.keys(json.folderList).filter((folder) => folder.trim() !== ""),
        foldersMetadata: json.folderList,
      };
      break;
    }

    default:
      return Promise.reject(new Error("Unsupported file format. Please upload a .xlsx or .json file."));
  }

  return Promise.resolve(result);
};

export const checkForExistingTransfer = async ({ accessToken, accession, application }): Promise<{ exists: boolean, processed: boolean }> => {
  if (!accessToken) return Promise.reject(new Error("Missing access token."));

  // Request url
  const apiUrl = await api.getCurrentApiUrl();
  const requestUrl = `${apiUrl}/transfer`;

  // Make request
  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return Promise.reject(new Error(`HTTP error! status: ${response.status}`));

  const jsonResponse = await response.json();

  if (jsonResponse.success) {
    const transfers = jsonResponse.data.transfers;

    const existingTransfer = transfers.find(
      (transfer) =>
        transfer.metadata.admin.accession === accession &&
        transfer.metadata.admin.application === application,
    );

    if (existingTransfer) {
      if (existingTransfer.status === "Transfer deleted") {
        //transfer was processed
        return Promise.resolve({ exists: true, processed: true });
      }
      // transfer has not been processed yet
      return Promise.resolve({ exists: true, processed: false });
    }
  } else {
    return Promise.reject(new Error("Failed to fetch transfers."));
  }

  // No existing transfer found
  return Promise.resolve({ exists: false, processed: false });
};
