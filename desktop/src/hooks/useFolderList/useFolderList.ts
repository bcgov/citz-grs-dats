import { useNavigate } from "@/hooks";
import { useGridApiRef } from "@mui/x-data-grid";
import type { FolderRow } from "@renderer/types";
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
  const { fetchProtectedRoute, refreshTokens } = window.api.sso;

  const handleProgress = useCallback(
    (event: CustomEvent<{ source: string; progressPercentage: number }>) => {
      const { source, progressPercentage } = event.detail;
      setFolders((prevFolderList) =>
        prevFolderList.map((folder) =>
          folder.folder === source
            ? { ...folder, progress: progressPercentage }
            : folder,
        ),
      );
    },
    [setFolders],
  );

  const handleCompletion = useCallback(
    (
      event: CustomEvent<{
        source: string;
        success: boolean;
        metadata?: Record<string, unknown>;
        extendedMetadata?: Record<string, unknown>;
        error?: unknown;
      }>,
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
      } else {
        console.error(`Failed to process folder: ${source}`);
      }
    },
    [setMetaData, setExtendedMetaData],
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
            opr: false,
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
    setFolders((prevFolderList) =>
      prevFolderList.filter((row) => row.folder !== folder)
    );
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

      setFolders([]);
      setMetaData({});
      setExtendedMetaData({});

      console.log("finish submit", { error, data, folders, metaData });
    },
    [fetchProtectedRoute, folders, metaData]
  );

  useEffect(() => {
    window.addEventListener(
      "folder-metadata-progress",
      handleProgress as EventListener,
    );
    window.addEventListener(
      "folder-metadata-completion",
      handleCompletion as EventListener,
    );

    return () => {
      window.removeEventListener(
        "folder-metadata-progress",
        handleProgress as EventListener,
      );
      window.removeEventListener(
        "folder-metadata-completion",
        handleCompletion as EventListener,
      );
    }
  }, [handleProgress])


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
    metaData,
    pendingPaths,
    removeFolder,
    setExtendedMetaData,
    setFolders,
    setMetaData,
    setPendingPaths,
    submit,
  };
};
