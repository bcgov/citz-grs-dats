import { useCallback, useState, useEffect } from 'react';
import type { FolderRow } from '../../renderer/src/components/file-list';
import { fetchProtectedRoute } from '@preload/api/sso/fetchProtectedRoute';

const testData = {
  "outputFileType": "excel",
  "metadata": {
    "folders": {
      "D:/test/Folder1": {
        "schedule": "123456",
        "classification": "654321-10",
        "file": "",
        "opr": true,
        "startDate": "2024/01/01",
        "endDate": "2024/12/31",
        "soDate": "2024/02/01",
        "fdDate": "2024/12/01"
      },
      "D:/test/Folder2": {
        "schedule": "654321",
        "classification": "123456-20",
        "file": "",
        "opr": false,
        "startDate": "2024/01/01",
        "endDate": "2024/12/31",
        "soDate": "2024/02/01",
        "fdDate": "2024/12/01"
      }
    },
    "files": {
      "D:/test/Folder1": [
        {
          "filepath": "/path/to/folder1/file1.txt",
          "filename": "file1.txt",
          "size": "12MB",
          "birthtime": "2024-11-01T10:00:00Z",
          "lastModified": "2024-11-10T12:00:00Z",
          "lastAccessed": "2024-11-15T15:00:00Z",
          "checksum": "abcd1234"
        },
        {
          "filepath": "/path/to/folder1/file2.txt",
          "filename": "file2.txt",
          "size": "2MB",
          "birthtime": "2024-11-02T10:00:00Z",
          "lastModified": "2024-11-11T12:00:00Z",
          "lastAccessed": "2024-11-16T15:00:00Z",
          "checksum": "efgh5678"
        }
      ],
      "D:/test/Folder2": [
        {
          "filepath": "/path/to/folder2/file3.txt",
          "filename": "file3.txt",
          "size": "3MB",
          "birthtime": "2024-11-03T10:00:00Z",
          "lastModified": "2024-11-12T12:00:00Z",
          "lastAccessed": "2024-11-17T15:00:00Z",
          "checksum": "ijkl91011"
        }
      ]
    },
    "admin": {
      "accession": "1234567",
      "application": "7654321"
    }
  }

}

const testToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJxUWlFWDB2T2Z1SlBuWUw4MWo0Q2tDOHVPdEJ1aFZvM0xBd2ppczZWbHRzIn0.eyJleHAiOjE3Mzc0MDc0MzEsImlhdCI6MTczNzQwNzEzMSwiYXV0aF90aW1lIjoxNzM3NDA2ODMwLCJqdGkiOiJjYjkzNzE3NS1hY2E0LTRlOWMtYTA0NC0wYjI3ZTQ4NjhhMzQiLCJpc3MiOiJodHRwczovL2Rldi5sb2dpbnByb3h5Lmdvdi5iYy5jYS9hdXRoL3JlYWxtcy9zdGFuZGFyZCIsImF1ZCI6ImNpdHotZ3JzLWRhdHMtY2lybW8taW1iLTU2MjMiLCJzdWIiOiJhMzJkNmY4NTljNjY0NTBjYTQ5OTViMGIyYmYwYTg0NEBpZGlyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiY2l0ei1ncnMtZGF0cy1jaXJtby1pbWItNTYyMyIsInNlc3Npb25fc3RhdGUiOiIwMTQ1MGMzMS0wZTQ3LTQzM2YtYTBlYi04MmM1MjE3Mzc2NWUiLCJzY29wZSI6Im9wZW5pZCBpZGlyIGVtYWlsIHByb2ZpbGUgYXp1cmVpZGlyIiwic2lkIjoiMDE0NTBjMzEtMGU0Ny00MzNmLWEwZWItODJjNTIxNzM3NjVlIiwiaWRpcl91c2VyX2d1aWQiOiJBMzJENkY4NTlDNjY0NTBDQTQ5OTVCMEIyQkYwQTg0NCIsImlkZW50aXR5X3Byb3ZpZGVyIjoiaWRpciIsImlkaXJfdXNlcm5hbWUiOiJTVE9FV1MiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJUb2V3cywgU2NvdHQgRCBDSVRaOkVYIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYTMyZDZmODU5YzY2NDUwY2E0OTk1YjBiMmJmMGE4NDRAaWRpciIsImRpc3BsYXlfbmFtZSI6IlRvZXdzLCBTY290dCBEIENJVFo6RVgiLCJnaXZlbl9uYW1lIjoiU2NvdHQiLCJmYW1pbHlfbmFtZSI6IlRvZXdzIiwiZW1haWwiOiJzY290dC50b2V3c0Bnb3YuYmMuY2EifQ.qnHdbmxEx4hRh5UTRLEyTG5E69lUNZ_6c3f9X6SKCtjQgTovD_8b76jqs5c0pNMrJJuhcODfDItu0_U4aKGeH3pdP5HKRGLUEofpomFECyb4qaDsaVOm_5acJDHC5RA2agWXNMDv3t6BMUDdzGkK5g0MPTc_JHmu_yzhqw_1q_798WOMM0REmTyWJ4V46NoRiFHaUoxbGtcSdX9wrwdDHpyctoOwRKVO0VFoAOIdyDjoc8cZDT-kVMQkwTeu9kr6K1PHSRWnk9tR3j8If4vIovxWavmsnc_T5_fuLvHm8N4ZEePg16o31fuU4ee4Go9gwQIU7bxsGn3B4gcMX88Fug'

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

  console.log('process.env',process.env);

  const submit = useCallback(
    async (formData) => {
      // on form submit print the data we currently have and reset rows to empty list
      // /filelist
      console.log("formData", formData);
      console.log('folders', folders);
      console.log('metadata', metaData);
      console.log('pendingPaths', pendingPaths);
      const response = await fetchProtectedRoute('http://localhost:3200/filelist', testToken, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(testData),
      });
      console.log('response', response);
    },
    [fetchProtectedRoute, metaData, folders, pendingPaths],
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
