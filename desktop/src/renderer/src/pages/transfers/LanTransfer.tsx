import { Grid2 as Grid, Stack, Typography } from "@mui/material";
import { Stepper, Toast } from "@renderer/components";
import { JustifyChangesModal } from "@renderer/components/transfer";
import {
  LanCompletionView,
  LanSubmissionAgreementView,
  LanUploadFileListView,
  LanUploadTransferFormView,
  LanUploadView,
} from "@renderer/components/transfer/lan-views";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type Folder = {
  id: number;
  folder: string;
  invalidPath: boolean;
  bufferProgress: number;
  metadataProgress: number;
};

type FolderPathChanges = { original: string; new: string };

type FileBufferObj = {
  filename: string;
  path: string;
  buffer: Buffer;
};

export const LanTransferPage = () => {
  const navigate = useNavigate();
  const [api] = useState(window.api); // Preload scripts
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [fileList, setFileList] = useState<File | null | undefined>(undefined);
  const [transferForm, setTransferForm] = useState<File | null | undefined>(
    undefined
  );

  // File list
  const [metadata, setMetadata] = useState<Record<string, unknown>>({});
  const [folderBuffers, setFolderBuffers] = useState<
    Record<string, FileBufferObj[]>
  >({});
  const [foldersToProcess, setFoldersToProcess] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [deletedFolders, setDeletedFolders] = useState<string[]>([]);
  const [changedFolderPaths, setChangedFolderPaths] = useState<
    FolderPathChanges[]
  >([]);

  if (folderBuffers) {
    // TEMP
  }

  // Justify changes
  const [showJustifyChangesModal, setShowJustifyChangesModal] = useState(false);
  const [changesJustification, setChangesJustification] = useState("");

  // Accession & application pulled from fileList
  const [accession, setAccession] = useState<string | undefined | null>(null);
  const [application, setApplication] = useState<string | undefined | null>(
    null
  );
  // User confirms if accession & application are correct
  const [confirmAccAppChecked, setConfirmAccAppChecked] =
    useState<boolean>(false);

  const onNextPress = () => {
    setCurrentViewIndex((prev) => prev + 1);
  };

  const onBackPress = () => {
    setCurrentViewIndex((prev) => prev - 1);
  };

  // Handle metadata progress and completion events
  useEffect(() => {
    const handleProgress = (
      event: CustomEvent<{ source: string; progressPercentage: number }>
    ) => {
      const { source, progressPercentage } = event.detail;
      console.log(`${source} metadata progress ${progressPercentage}`);
      // Update folder progress
      setFolders((prevRows) =>
        prevRows.map((row) =>
          row.folder === source
            ? { ...row, metadataProgress: progressPercentage }
            : row
        )
      );
    };

    const handleMissingPath = (event: CustomEvent<{ path: string }>) => {
      const { path } = event.detail;
      console.log("Missing", path);
      // Update folder invalidPath
      setFolders((prevRows) =>
        prevRows.map((row) =>
          row.folder === path ? { ...row, invalidPath: true } : row
        )
      );
    };

    const handleCompletion = (
      event: CustomEvent<{
        source: string;
        success: boolean;
        metadata?: Record<string, unknown>;
        error?: unknown;
      }>
    ) => {
      const { source, success, metadata: newMetadata, error } = event.detail;

      if (success && newMetadata) {
        setMetadata((prev) => ({
          ...prev,
          [source]: newMetadata[source],
        }));
        console.log(`Successfully processed folder metadata: ${source}`);
      } else {
        console.error(`Failed to process folder metadata: ${source}`, {
          success,
          metadata: newMetadata,
          error,
        });
      }
    };

    window.addEventListener(
      "folder-metadata-progress",
      handleProgress as EventListener
    );
    window.addEventListener(
      "folder-metadata-missing-path",
      handleMissingPath as EventListener
    );
    window.addEventListener(
      "folder-metadata-completion",
      handleCompletion as EventListener
    );

    return () => {
      window.removeEventListener(
        "folder-metadata-progress",
        handleProgress as EventListener
      );
      window.removeEventListener(
        "folder-metadata-missing-path",
        handleMissingPath as EventListener
      );
      window.removeEventListener(
        "folder-metadata-completion",
        handleCompletion as EventListener
      );
    };
  }, []);

  // Handle buffer progress and completion events
  useEffect(() => {
    const handleProgress = (
      event: CustomEvent<{ source: string; progressPercentage: number }>
    ) => {
      const { source, progressPercentage } = event.detail;
      console.log(`${source} buffer progress ${progressPercentage}`);
      // Update folder progress
      setFolders((prevRows) =>
        prevRows.map((row) =>
          row.folder === source
            ? { ...row, bufferProgress: progressPercentage }
            : row
        )
      );
    };

    const handleMissingPath = (event: CustomEvent<{ path: string }>) => {
      const { path } = event.detail;
      console.log("Missing", path);
      // Update folder invalidPath
      setFolders((prevRows) =>
        prevRows.map((row) =>
          row.folder === path ? { ...row, invalidPath: true } : row
        )
      );
    };

    const handleCompletion = (
      event: CustomEvent<{
        source: string;
        success: boolean;
        buffers?: FileBufferObj[];
        error?: unknown;
      }>
    ) => {
      const { source, success, buffers, error } = event.detail;

      if (success && buffers && buffers.length > 0) {
        setFolderBuffers((prev) => ({
          ...prev,
          [source]: buffers,
        }));
        console.log(`Successfully processed folder buffer: ${source}`);
      } else {
        console.error(`Failed to process folder buffer: ${source}`, {
          success,
          error,
        });
      }
    };

    window.addEventListener(
      "folder-buffer-progress",
      handleProgress as EventListener
    );
    window.addEventListener(
      "folder-buffer-missing-path",
      handleMissingPath as EventListener
    );
    window.addEventListener(
      "folder-buffer-completion",
      handleCompletion as EventListener
    );

    return () => {
      window.removeEventListener(
        "folder-buffer-progress",
        handleProgress as EventListener
      );
      window.removeEventListener(
        "folder-buffer-missing-path",
        handleMissingPath as EventListener
      );
      window.removeEventListener(
        "folder-buffer-completion",
        handleCompletion as EventListener
      );
    };
  }, []);

  // Get folder metadata and buffers after file list uploaded
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (foldersToProcess.length > 0) {
      const pathsToProcess = [...foldersToProcess];
      setFoldersToProcess([]); // Clear pending paths to avoid duplicates

      // Add to folders array
      const foldersToAdd = pathsToProcess
        .map((path, index) => {
          if (folders.some((row) => row.folder === path)) return;
          let uniqueID = folders.length + index;
          const existingIDs = new Set(folders.map((row) => row.id));

          while (existingIDs.has(uniqueID)) uniqueID++;

          return {
            id: uniqueID,
            folder: path,
            invalidPath: false,
            metadataProgress: 0,
            bufferProgress: 0,
          };
        })
        .filter((row) => row !== undefined);
      setFolders((prev) => [...prev, ...foldersToAdd]);

      pathsToProcess.forEach((filePath) => {
        getFolderMetadata(filePath).catch((error) =>
          console.error(
            `Failed to fetch metadata for folder ${filePath}:`,
            error
          )
        );
        getFolderBuffer(filePath).catch((error) =>
          console.error(
            `Failed to fetch buffers for folder ${filePath}:`,
            error
          )
        );
      });
    }
  }, [foldersToProcess]);

  const getFolderMetadata = async (filePath: string) => {
    try {
      await api.workers.getFolderMetadata({
        filePath,
      });
    } catch (error) {
      console.error(`Failed to fetch metadata for folder ${filePath}:`, error);
    }
  };

  const getFolderBuffer = async (filePath: string) => {
    try {
      await api.workers.getFolderBuffer({
        filePath,
      });
    } catch (error) {
      console.error(`Failed to fetch buffers for folder ${filePath}:`, error);
    }
  };

  const processRowUpdate = (newFolder: Folder) => {
    // Update the row in the state
    setFolders((prevRows) =>
      prevRows.map((row) => (row.id === newFolder.id ? newFolder : row))
    );
    return newFolder;
  };

  const handleEditClick = async (folderPath: string) => {
    const result = await api.selectDirectory({ singleSelection: true });

    setFolders((prev) =>
      prev.map((row) => {
        if (row.folder === folderPath)
          return { ...row, folder: result[0], invalidPath: false };
        return row;
      })
    );
    setChangedFolderPaths((prev) => [
      ...prev,
      { original: folderPath, new: result[0] },
    ]);
    setFoldersToProcess((prev) => [...prev, result[0]]);
  };

  // Parse JSON file list
  const parseJsonFile = (): Promise<object> => {
    return new Promise((resolve, reject) => {
      if (fileList) {
        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            if (event.target?.result) {
              const jsonObject = JSON.parse(event.target.result as string);
              resolve(jsonObject);
            } else {
              reject(new Error("File content is empty."));
            }
          } catch (error) {
            reject(new Error("Invalid JSON file."));
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read the file."));
        };

        reader.readAsText(fileList);
      }
    });
  };

  const parseFileList = async () => {
    if (fileList) {
      // Pull accession nad application numbers from xlsx or json file.
      const fileName = fileList.name.toLowerCase();

      if (fileName.endsWith(".xlsx")) {
        // Xlsx file
        const result = await api.transfer.parseXlsxFileList(fileList);
        if (result) {
          const { accession, application, folders } = result;
          setAccession(accession);
          setApplication(application);
          setFoldersToProcess(folders);
        } else {
          toast.error(Toast, {
            data: {
              title: "Missing accession and/or application number",
              message:
                "Your file list (ARS 662) is missing an accession and/or application number. Please add this information to the ‘Cover Page’ tab in the file list and save it, then try uploading the file again.",
            },
          });
        }
      } else if (fileName.endsWith(".json")) {
        // Json file
        type JsonFileList = {
          admin: { accession: string; application: string };
          folders: Record<string, unknown>;
        };
        const json = (await parseJsonFile()) as JsonFileList | null;
        if (json) {
          const accession = json.admin.accession;
          const application = json.admin.application;
          const folders = json.folders;
          if (
            !accession ||
            !application ||
            accession === "" ||
            application === ""
          )
            toast.error(Toast, {
              data: {
                title: "Missing accession and/or application number",
                message:
                  "Your file list (ARS 662) is missing an accession and/or application number. Please add this information to the ‘admin’ property in the file list and save it, then try uploading the file again.",
              },
            });
          setAccession(accession);
          setApplication(application);
          setFoldersToProcess(Object.keys(folders));
        }
      }
    } else {
      // Reset when file removed
      setAccession(null);
      setApplication(null);
      setFoldersToProcess([]);
      setConfirmAccAppChecked(false);
    }
  };

  useEffect(() => {
    console.log(metadata);
  }, [metadata]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!fileList) {
      setFolders([]);
      setMetadata({});
    }
    parseFileList();
  }, [fileList]);

  // Ask for justification of changes if any folder paths changed or deleted
  const handleLanUploadNextPress = () => {
    if (deletedFolders.length > 0 || changedFolderPaths.length > 0)
      setShowJustifyChangesModal(true);
    else onNextPress();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (currentViewIndex === 3) {
      // Open of upload view
      if (folders.some((folder) => folder.invalidPath)) {
        toast.error(Toast, {
          data: {
            title: "Folder upload unsuccessful",
            message:
              "One or more of your folders was not successfully uploaded. Update the folder path(s) by clicking the corresponding Edit icon. You may need to scroll within the table to locate the folders that have not loaded properly.",
          },
        });
      }
    } else if (currentViewIndex === 4) {
      // Send transfer to API
      // TODO
    }
  }, [currentViewIndex]);

  // Send to home on completion
  const handleCompletion = () => navigate("/");

  return (
    <Grid container sx={{ paddingBottom: "20px" }}>
      <Grid size={2} />
      <Grid size={8} sx={{ paddingTop: 3 }}>
        <Stack gap={2}>
          <Typography variant="h2">Send records from LAN Drive</Typography>
          <Stepper
            items={[
              "File list",
              "Transfer form",
              "Submission agreement",
              "Confirmation",
              "Done",
            ]}
            currentIndex={currentViewIndex}
          />
          {currentViewIndex === 0 && (
            <LanUploadFileListView
              file={fileList}
              setFile={setFileList}
              accession={accession}
              application={application}
              confirmChecked={confirmAccAppChecked}
              setConfirmChecked={setConfirmAccAppChecked}
              onNextPress={onNextPress}
            />
          )}
          {currentViewIndex === 1 && (
            <LanUploadTransferFormView
              file={transferForm}
              setFile={setTransferForm}
              onNextPress={onNextPress}
              onBackPress={onBackPress}
            />
          )}
          {currentViewIndex === 2 && (
            <LanSubmissionAgreementView
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              accession={accession!}
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              application={application!}
              onNextPress={onNextPress}
              onBackPress={onBackPress}
            />
          )}
          {currentViewIndex === 3 && (
            <LanUploadView
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              accession={accession!}
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              application={application!}
              folders={folders}
              setFolders={setFolders}
              processRowUpdate={processRowUpdate}
              setMetadata={setMetadata}
              setDeletedFolders={setDeletedFolders}
              onFolderEdit={handleEditClick}
              onNextPress={handleLanUploadNextPress}
              onBackPress={onBackPress}
            />
          )}
          {currentViewIndex === 4 && (
            <LanCompletionView
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              accession={accession!}
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              application={application!}
              onNextPress={handleCompletion}
            />
          )}
          <JustifyChangesModal
            open={showJustifyChangesModal}
            onClose={() => setShowJustifyChangesModal(false)}
            explanation={changesJustification}
            setExplanation={setChangesJustification}
            onConfirm={() => {
              setShowJustifyChangesModal(false);
              onNextPress();
            }}
          />
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
