import { useNavigate } from "@/renderer/hooks";
import { useGridApiRef } from "@mui/x-data-grid";
import type { FolderRow } from "@/renderer/types";
import { useCallback, useEffect, useState } from "react";
import { convertArrayToObject } from "./convertArrayToObject";

export const useFolderList = () => {
  const apiRef = useGridApiRef();
  const { setCanLoseProgress } = useNavigate();

  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [metaData, setMetaData] = useState<Record<string, unknown>>({});
  const [extendedMetaData, setExtendedMetaData] = useState<
    Record<string, unknown>
  >({});
  const [pendingPaths, setPendingPaths] = useState<string[]>([]);
  const [workers] = useState(window.api.workers);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { fetchProtectedRoute, refreshTokens } = window.api.sso;

  const handleProgress = useCallback(
    (event: CustomEvent<{ source: string; progressPercentage: number; fileProcessed?: string; currentFileIndex?: number; totalFiles?: number }>) => {
      const { source, progressPercentage, fileProcessed, currentFileIndex: fileIdx, totalFiles: total } = event.detail;
      const folderName = source.split("\\").pop() ?? source;
      console.log(`[${folderName}] Processing ${fileProcessed}... (${fileIdx}/${total}) - ${progressPercentage}%`);

      // Determine phase from fileProcessed value
      const isExtendedPhase = fileProcessed === "Getting extended metadata...";
      const isOwnerPhase = fileProcessed === "Checking owners...";

      if (isExtendedPhase || isOwnerPhase) {
        setProcessingMessage(`Finalizing extended metadata for ${folderName}`);
      } else if (fileProcessed) {
        setProcessingMessage(`Gathering metadata for ${fileProcessed} (${fileIdx}/${total}) of ${folderName}`);
      } else {
        setProcessingMessage(`Gathering metadata for ${folderName}`);
      }

      setFolders((prevFolderList) =>
        prevFolderList.map((folder) =>
          folder.folder === source
            ? { ...folder, progress: progressPercentage }
            : folder
        )
      );
    },
    [setFolders]
  );

  const handleCompletion = useCallback(
    (
      event: CustomEvent<{
        source: string;
        success: boolean;
        metadata?: Record<string, unknown>;
        extendedMetadata?: Record<string, unknown>;
        fileCount?: number;
        error?: unknown;
      }>
    ) => {
      const {
        source,
        success,
        metadata: newMetadata,
        extendedMetadata: newExtendedMetadata,
      } = event.detail;

      if (success && newMetadata) {
        setMetaData((prev) => ({
          ...prev,
          [source]: newMetadata[source],
        }));
        if (newExtendedMetadata) setExtendedMetaData(newExtendedMetadata);
        console.info(`Successfully processed folder: ${source}`);
        setProcessingMessage(null);
        setFolders((prevFolderList) =>
          prevFolderList.map((folder) =>
            folder.folder === source
              ? { ...folder, progress: 100 }
              : folder
          )
        );
        setIsPaused(false);
      } else {
        console.error(`Failed to process folder: ${source}`);
        setProcessingMessage(
          `Metadata processing failed for ${source}. Delete or edit the folder to retry.`
        );
        setIsPaused(false);
      }
    },
    [setMetaData, setExtendedMetaData]
  );

  const getFolderMetadata = useCallback(
    async (filePath: string) => {
      try {
        await workers.getFolderMetadata({
          filePath,
        });
      } catch (error) {
        console.error(
          `Failed to fetch metadata for folder ${filePath}:`,
          error
        );
      }
    },
    [workers]
  );

  const addPathArrayToFolders = useCallback(
    (inputPaths: string[]) => {
      const newFolderList: FolderRow[] = [...folders];
      let index = folders.length; // Start IDs based on the current rows
      const pathsToProcess: string[] = [];

      try {
        for (const filePath of inputPaths) {
          // Check if filePath is already in the rows
          const isAlreadyInFolders = folders.some(
            (row) => row.folder === filePath
          );

          if (isAlreadyInFolders || filePath === "") continue; // Skip if filePath is already in rows

          const curFolderRow: FolderRow = {
            id: index, // Unique IDs for new rows
            folder: filePath,
            schedule: "",
            classification: "",
            file: "",
            opr: true,
            startDate: null,
            endDate: null,
            soDate: null,
            fdDate: null,
            progress: 0,
          };

          newFolderList.push(curFolderRow);
          pathsToProcess.push(filePath); // Add path to pending processing
          index++;
        }

        setFolders(newFolderList); // Update rows first
        setPendingPaths((prev) => [...prev, ...pathsToProcess]); // Add paths to pendingPaths

        // Set initial processing message for newly added folders
        if (pathsToProcess.length > 0) {
          const folderName = pathsToProcess[0].split("\\").pop() ?? pathsToProcess[0];
          setProcessingMessage(`Gathering metadata for ${folderName}`);
        }

        // Set all newly added rows to edit mode
        if (apiRef.current && newFolderList.length > 0) {
          setTimeout(() => {
            newFolderList.forEach(({ id }) => {
              const isRowInEditMode = apiRef.current.getRowMode(id) === "edit";
              if (!isRowInEditMode) {
                apiRef.current.startRowEditMode({ id });
              }
            });
          });
        }
      } catch (error) {
        setFolders(folders);
        console.error("Error adding folders:", error);
      }
    },
    [folders]
  );

  const removeFolder = useCallback((folder: string) => {
    window.api.deleteMetadataState(folder);
    setFolders((prevFolderList) =>
      prevFolderList.filter((row) => row.folder !== folder)
    );
    setProcessingMessage(null);
    setMetaData((prevMetadata) => {
      const { [folder]: _, ...remainingMetadata } = prevMetadata; // Remove the deleted folder
      return remainingMetadata;
    });
  }, []);

  const submit = useCallback(
    async (formData) => {
      // on form submit print the data we currently have and reset rows to empty list
      // /filelist
      const payload = {
        metadata: {
          admin: {
            application: formData.applicationNumber,
            accession: formData.accessionNumber,
          },
          folders: convertArrayToObject(folders),
          files: metaData,
        },
        extendedMetadata: extendedMetaData,
        outputFileType: formData.outputFormat,
      };
      const apiUrl = await window.api.getCurrentApiUrl();

      const tokens = await refreshTokens();

      const [error, data] = await fetchProtectedRoute(
        `${apiUrl}/filelist`,
        tokens?.accessToken,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (error) throw new Error(`Failed create file list request: ${error}`);

      const result = data.result.json;

      if (result && !result.success)
        throw new Error(`Failed create file list request: ${result.message}`);

      await Promise.all(
        folders.map((folder) => window.api.deleteMetadataState(folder.folder))
      );

      setFolders([]);
      setMetaData({});
      setExtendedMetaData({});

      console.log("finish submit", { error, data, folders, metaData });
    },
    [fetchProtectedRoute, folders, metaData]
  );

  const handlePaused = useCallback(
    (event: CustomEvent<{ source: string; error?: string }>) => {
      const { source } = event.detail;
      const folderName = source.split("\\").pop() ?? source;
      console.log(`[${folderName}] Metadata collection paused — waiting for network...`);
      setProcessingMessage(`Paused — waiting for network reconnect`);
      setIsPaused(true);
    },
    []
  );

  const handleResumed = useCallback(
    (event: CustomEvent<{ source: string }>) => {
      const { source } = event.detail;
      const folderName = source.split("\\").pop() ?? source;
      console.log(`[${folderName}] Network recovered, resuming metadata collection...`);
      setProcessingMessage(`Network reconnected, resuming`);
      setIsPaused(false);
    },
    []
  );

  const handleStatus = useCallback(
    (event: CustomEvent<{ source: string; message: string }>) => {
      const { message } = event.detail;
      console.log(`[Metadata] ${message}`);
      setProcessingMessage(message);
    },
    []
  );

  useEffect(() => {
    window.addEventListener(
      "folder-metadata-progress",
      handleProgress as EventListener
    );
    window.addEventListener(
      "folder-metadata-completion",
      handleCompletion as EventListener
    );
    window.addEventListener(
      "folder-metadata-paused",
      handlePaused as EventListener
    );
    window.addEventListener(
      "folder-metadata-resumed",
      handleResumed as EventListener
    );
    window.addEventListener(
      "folder-metadata-status",
      handleStatus as EventListener
    );

    return () => {
      window.removeEventListener(
        "folder-metadata-progress",
        handleProgress as EventListener
      );
      window.removeEventListener(
        "folder-metadata-completion",
        handleCompletion as EventListener
      );
      window.removeEventListener(
        "folder-metadata-paused",
        handlePaused as EventListener
      );
      window.removeEventListener(
        "folder-metadata-resumed",
        handleResumed as EventListener
      );
      window.removeEventListener(
        "folder-metadata-status",
        handleStatus as EventListener
      );
    };
  }, [handleProgress, handlePaused, handleResumed]);

  useEffect(() => {
    // Process pending paths for metadata
    if (pendingPaths.length > 0) {
      const pathsToProcess = [...pendingPaths];
      setPendingPaths([]); // Clear pending paths to avoid duplicates

      pathsToProcess.forEach((filePath) => {
        getFolderMetadata(filePath).catch((error) =>
          console.error(
            `Failed to fetch metadata for folder ${filePath}:`,
            error
          )
        );
      });
    }
  }, [pendingPaths, getFolderMetadata]);

  useEffect(() => {
    // Set the canLoseProgress state based on the folder list
    setCanLoseProgress(folders.length > 0);
  }, [folders, setCanLoseProgress]);

  return {
    addPathArrayToFolders,
    apiRef,
    folders,
    extendedMetaData,
    getFolderMetadata,
    isPaused,
    metaData,
    pendingPaths,
    processingMessage,
    removeFolder,
    setExtendedMetaData,
    setFolders,
    setMetaData,
    setPendingPaths,
    submit,
  };
};
