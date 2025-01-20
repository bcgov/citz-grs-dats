import { useCallback, useState, useEffect, useContext } from 'react';
import type { FolderRow } from '../../renderer/src/components/file-list';
import { fetchProtectedRoute } from '@preload/api/sso/fetchProtectedRoute';
import { convertArrayToObject } from './convertArrayToObect';

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

const testToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJxUWlFWDB2T2Z1SlBuWUw4MWo0Q2tDOHVPdEJ1aFZvM0xBd2ppczZWbHRzIn0.eyJleHAiOjE3Mzc0MTA3ODMsImlhdCI6MTczNzQxMDQ4MywiYXV0aF90aW1lIjoxNzM3NDEwNDgzLCJqdGkiOiIzZGYxNzg4Yi05MzE2LTQzZmUtYmI1ZC02ZTlmNmYxN2JkMTMiLCJpc3MiOiJodHRwczovL2Rldi5sb2dpbnByb3h5Lmdvdi5iYy5jYS9hdXRoL3JlYWxtcy9zdGFuZGFyZCIsImF1ZCI6ImNpdHotZ3JzLWRhdHMtY2lybW8taW1iLTU2MjMiLCJzdWIiOiJhMzJkNmY4NTljNjY0NTBjYTQ5OTViMGIyYmYwYTg0NEBpZGlyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiY2l0ei1ncnMtZGF0cy1jaXJtby1pbWItNTYyMyIsInNlc3Npb25fc3RhdGUiOiI4ZTRhMzVlMC01ODFhLTRkNTktYjE2OC03ZDhjNDlkODA4ZGEiLCJzY29wZSI6Im9wZW5pZCBpZGlyIGVtYWlsIHByb2ZpbGUgYXp1cmVpZGlyIiwic2lkIjoiOGU0YTM1ZTAtNTgxYS00ZDU5LWIxNjgtN2Q4YzQ5ZDgwOGRhIiwiaWRpcl91c2VyX2d1aWQiOiJBMzJENkY4NTlDNjY0NTBDQTQ5OTVCMEIyQkYwQTg0NCIsImlkZW50aXR5X3Byb3ZpZGVyIjoiaWRpciIsImlkaXJfdXNlcm5hbWUiOiJTVE9FV1MiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJUb2V3cywgU2NvdHQgRCBDSVRaOkVYIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYTMyZDZmODU5YzY2NDUwY2E0OTk1YjBiMmJmMGE4NDRAaWRpciIsImRpc3BsYXlfbmFtZSI6IlRvZXdzLCBTY290dCBEIENJVFo6RVgiLCJnaXZlbl9uYW1lIjoiU2NvdHQiLCJmYW1pbHlfbmFtZSI6IlRvZXdzIiwiZW1haWwiOiJzY290dC50b2V3c0Bnb3YuYmMuY2EifQ.BHKiTmqpWHSU8BUZMzo5EIkyqKFbQFxFaZc-trD6iVG7IWnxZFDTqVPPMvNXiCqQrx7prSDTXAZrAxZqA_UwAsYCsf2lL7kE82QOXGiECVuRFtAF-yn0iTmNEFR61dgyJDnrOy5fMZllLum0hiuxydi_OpSGflQgNgtm0PFwQ2zlyY2OWm6XptIMSauSGo-mIsgav4cRpA8atWiDsVf_lrHK6xBSYv1qTQajsjmDcsUNGq83F3QGaZ8aSxxfOBj8uZNgfSquLx6HxX3-F-RbT6-bRZ9op4Y422RjXxFNW6TEOmB6dPXiEwtOjR4MfIntcv-JMeBNQmXjvOujv7iNHg'

export const useFolderList = ({ accessToken }) => {
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
    async (formData) => {
      // on form submit print the data we currently have and reset rows to empty list
      // /filelist
      const payload = {
        metadata: {
          admin: {
            application: formData.application,
            accession: formData.accession,
          },
          folders: convertArrayToObject(folders),
          files: metaData,
        },
        outputFileType: formData.outputFormat,

      };

      const response = await fetchProtectedRoute('http://localhost:3200/filelist', accessToken, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setFolders([]);
      setMetaData({});

      console.log('finish submit', { response, folders, metaData });
    },
    [accessToken, metaData, folders],
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
