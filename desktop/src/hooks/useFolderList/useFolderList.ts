import { useCallback, useState, useEffect } from 'react';
import type { FolderRow } from '../../renderer/src/components/file-list';

export const useFolderList = () => {
  const [folders, setFolders] = useState<FolderRow[]>([])
  const [metaData, setMetaData] = useState<Record<string, unknown>>({})
  const [workers] = useState(window.api.workers);
  const [pendingPaths, setPendingPaths] = useState<string[]>([]);

  const getFolderMetadata = useCallback(
    async (filePath: string) => {
      try {
        await workers.getFolderMetadata({
          filePath,
        });
      } catch (error) {
        console.error(
          `Failed to fetch metadata for folder ${filePath}:`,
          error,
        );
      }
    },
    [workers],
  );

  const addPathArrayToFolders = useCallback(
    (inputPaths: string[], apiRef) => {
      const newFolderList: FolderRow[] = [...folders];
      let index = folders.length; // Start IDs based on the current rows
      const pathsToProcess: string[] = [];

      try {
        for (const filePath of inputPaths) {
          // Check if filePath is already in the rows
          const isAlreadyInFolders = folders.some(
            (row) => row.folder === filePath,
          );

          if (isAlreadyInFolders || filePath === '') continue; // Skip if filePath is already in rows

          const curFolderRow: FolderRow = {
            id: index, // Unique IDs for new rows
            folder: filePath,
            schedule: '',
            classification: '',
            file: '',
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
              const isRowInEditMode = apiRef.current.getRowMode(id) === 'edit';
              if (!isRowInEditMode) {
                apiRef.current.startRowEditMode({ id });
              }
            });
          });
        }
      } catch (error) {
        setFolders(folders);
        console.error('Error adding folders:', error);
      }
    },
    [folders],
  )

  const removeFolder = useCallback(
    (folder: string) => {
      setFolders((prevFolderList) =>
        prevFolderList.filter((row) => row.folder !== folder),
      );
      setMetaData((prevMetadata) => {
        const { [folder]: _, ...remainingMetadata } = prevMetadata; // Remove the deleted folder
        return remainingMetadata;
      });
    }, [],
  )

  const submit = useCallback(
    (formData) => {
      // on form submit print the data we currently have and reset rows to empty list
      console.log("formData", formData);
      console.log('folders', folders);
      console.log('metadata', metaData);
      console.log('pendingPaths', pendingPaths);
    },
    [],
  )


  useEffect(() => {
    // Process pending paths for metadata
    if (pendingPaths.length > 0) {
      const pathsToProcess = [...pendingPaths];
      setPendingPaths([]); // Clear pending paths to avoid duplicates

      pathsToProcess.forEach((filePath) => {
        getFolderMetadata(filePath).catch((error) =>
          console.error(
            `Failed to fetch metadata for folder ${filePath}:`,
            error,
          ),
        );
      });
    }
  }, [pendingPaths, getFolderMetadata]);

  return { folders, setFolders, metaData, setMetaData, getFolderMetadata, addPathArrayToFolders, pendingPaths, setPendingPaths, removeFolder, submit };
};
