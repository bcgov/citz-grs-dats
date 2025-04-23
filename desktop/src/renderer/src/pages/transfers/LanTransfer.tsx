import { useAuth, useNavigate } from "@/hooks";
import { Grid2 as Grid, Stack, Typography } from "@mui/material";
import { LoginRequiredModal, Stepper, Toast } from "@renderer/components";
import { JustifyChangesModal } from "@renderer/components/transfer";
import { FinishView } from "@renderer/components/transfer/finish-view";
import {
  LanConfirmationView,
  LanSubmissionAgreementView,
  LanUploadFileListView,
  LanUploadTransferFormView,
} from "@renderer/components/transfer/lan-views";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getXlsxFileListToastData,
  parseJsonFile,
  type ToastData,
} from "./utils";

type Folder = {
  id: number;
  folder: string;
  invalidPath: boolean;
  bufferProgress: number;
  metadataProgress: number;
};

type FolderUploadChange = {
  originalFolderPath: string;
  newFolderPath?: string;
  deleted: boolean;
};

type FileBufferObj = {
  filename: string;
  path: string;
  buffer: Buffer;
};

type RunningWorker = {
  id?: string | null;
  type: "metadata" | "buffer";
  folder: string;
};

export const LanTransferPage = () => {
  const [api] = useState(window.api); // Preload scripts

  const { navigate, setCanLoseProgress } = useNavigate();
  const { idToken, accessToken, refresh } = useAuth();

  const handleLogout = async () => await api.sso.logout(idToken);

  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [fileList, setFileList] = useState<File | null | undefined>(undefined);
  const [transferForm, setTransferForm] = useState<File | null | undefined>(
    undefined
  );
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  // Request to send transfer
  const [requestSuccessful, setRequestSuccessful] = useState<boolean | null>(
    null
  );
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const [runningWorkers, setRunningWorkers] = useState<RunningWorker[]>([]);

  // File list
  const [metadata, setMetadata] = useState<Record<string, unknown>>({});
  const [extendedMetadata, setExtendedMetadata] = useState<
    Record<string, unknown>
  >({});
  const [originalFolderList, setOriginalFolderList] = useState<
    Record<string, unknown>
  >({});
  const [folderBuffers, setFolderBuffers] = useState<
    Record<string, FileBufferObj[]>
  >({});
  const [foldersToProcess, setFoldersToProcess] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [changes, setChanges] = useState<FolderUploadChange[]>([]);

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
      const currentProgress =
        folders.find((row) => row.folder === source)?.metadataProgress ?? 0;

      if (currentProgress !== 100)
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
      console.log("[Metadata] Missing", path);
      // Update folder invalidPath
      setFolders((prevRows) =>
        prevRows.map((row) =>
          row.folder === path ? { ...row, invalidPath: true } : row
        )
      );
    };

    const handleEmptyFolder = (event: CustomEvent<{ path: string }>) => {
      const { path } = event.detail;
      console.log("[Metadata] Empty folder", path);
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
        extendedMetadata?: Record<string, unknown>;
        error?: unknown;
      }>
    ) => {
      const {
        source,
        success,
        metadata: newMetadata,
        extendedMetadata: newExtendedMetadata,
        error,
      } = event.detail;

      if (success && newMetadata) {
        // Store metadata state
        setMetadata((prev) => ({
          ...prev,
          [source]: newMetadata[source],
        }));
        if (newExtendedMetadata) setExtendedMetadata(newExtendedMetadata);

        // Remove the completed worker
        setRunningWorkers((prev) =>
          prev.filter(
            (worker) =>
              !(worker.folder === source && worker.type === "metadata")
          )
        );

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
      "folder-metadata-empty-folder",
      handleEmptyFolder as EventListener
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
        "folder-metadata-empty-folder",
        handleEmptyFolder as EventListener
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
      const currentProgress =
        folders.find((row) => row.folder === source)?.bufferProgress ?? 0;

      if (currentProgress !== 100)
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
      console.log("[Buffers] Missing", path);
      // Update folder invalidPath
      setFolders((prevRows) =>
        prevRows.map((row) =>
          row.folder === path ? { ...row, invalidPath: true } : row
        )
      );
    };

    const handleEmptyFolder = (event: CustomEvent<{ path: string }>) => {
      const { path } = event.detail;
      console.log("[Buffers] Empty folder", path);
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
        const sourceParts = source?.split("\\");
        const parentFolder = sourceParts[sourceParts.length - 1];

        setFolderBuffers((prev) => ({
          ...prev,
          [parentFolder ?? source]: buffers,
        }));

        // Remove the completed worker
        setRunningWorkers((prev) =>
          prev.filter(
            (worker) =>
              !(worker.folder === parentFolder && worker.type === "buffer")
          )
        );

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
      "folder-buffer-empty-folder",
      handleEmptyFolder as EventListener
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
        "folder-buffer-empty-folder",
        handleEmptyFolder as EventListener
      );
      window.removeEventListener(
        "folder-buffer-completion",
        handleCompletion as EventListener
      );
    };
  }, []);

  // Get folder metadata and buffers after file list uploaded
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

  const getFolderBuffer = async (filePath: string) => {
    try {
      const response = await api.workers.getFolderBuffer({ filePath });

      if (response.success) {
        const workerId = response.workerId;

        // Add to runningWorkers
        setRunningWorkers((prev) => [
          ...prev,
          { id: workerId, type: "buffer", folder: filePath },
        ]);
      }
    } catch (error) {
      console.error(`Failed to fetch buffers for folder ${filePath}:`, error);
    }
  };

  const handleShutdownWorker = async (folder: string) => {
    const workersToShutdown = runningWorkers.filter(
      (worker) => worker.folder === folder
    );

    for (const worker of workersToShutdown) {
      if (worker.id) {
        await api.workers.shutdownById(worker.id);
      }
    }

    // Remove workers from the running list
    setRunningWorkers((prev) =>
      prev.filter((worker) => worker.folder !== folder)
    );
  };

  const processRowUpdate = (newFolder: Folder) => {
    // Update the row in the state
    setFolders((prevRows) =>
      prevRows.map((row) => (row.id === newFolder.id ? newFolder : row))
    );
    return newFolder;
  };

  const handleEditClick = async (folderPath: string): Promise<void> => {
    const result = await api.selectDirectory({ singleSelection: true });
    const selectedFolderPath = result[0];

    if (!selectedFolderPath) return;

    // Folder already exists in file list.
    if (folders.some((row) => row.folder === selectedFolderPath)) {
      toast.error(Toast, {
        data: {
          success: false,
          title: "Folder edit unsuccessful",
          message:
            "The folder path you selected is already used in the file list. Please select a different folder path.",
        },
      });
      return;
    }

    setFolders((prev) =>
      prev.map((row) => {
        if (row.folder === folderPath)
          return { ...row, folder: selectedFolderPath, invalidPath: false };
        return row;
      })
    );
    setChanges((prev) => [
      ...prev,
      {
        originalFolderPath: folderPath,
        newFolderPath: selectedFolderPath,
        deleted: false,
      },
    ]);
    setFoldersToProcess((prev) => [...prev, selectedFolderPath]);
  };

  const parseFileList = async () => {
    if (!fileList) {
      // Reset when file removed
      setAccession(null);
      setApplication(null);
      setFoldersToProcess([]);
      setConfirmAccAppChecked(false);
      await api.workers.shutdown();
      return;
    }

    // Pull accession nad application numbers from xlsx or json file.
    const fileName = fileList.name.toLowerCase();

    if (fileName.endsWith(".xlsx")) {
      // Xlsx file
      try {
        const result = await api.transfer.parseXlsxFileList(fileList);

        // Save results
        const { accession, application, folders, foldersMetadata } = result;
        setAccession(accession);
        setApplication(application);
        setFoldersToProcess(folders);
        setOriginalFolderList(foldersMetadata);
      } catch (error) {
        setFileList(null);
        if (error instanceof Error) {
          const toastData = getXlsxFileListToastData(error.message);

          // Create a toast message
          return toast.error(Toast, { data: toastData });
        }
        // Unexpected error
        return toast.error(Toast, {
          data: {
            success: false,
            title: "Unexpected error",
            message: `Encountered an unexpected error while parsing your file list (ARS 662). Please contact someone from the DATS team for assistance. Error: ${error}`,
          },
        });
      }
    } else if (fileName.endsWith(".json")) {
      // Json file
      type JsonFileList = {
        admin: { accession: string; application: string };
        folderList: Record<string, unknown>;
      };
      const json = (await parseJsonFile(fileList)) as JsonFileList | null;

      let toastData: ToastData | undefined = undefined;

      if (!json) {
        // Invalid JSON
        return toast.error(Toast, {
          data: {
            success: false,
            title: "Invalid json",
            message:
              "Your file list (ARS 662) could not be parsed. Please make sure it is formatted correctly and save it, then try uploading the file again.",
          },
        });
      }

      const accession = json.admin.accession;
      const application = json.admin.application;
      const folders = json.folderList;

      const folderKeys = Object.keys(folders);
      const hasDuplicates = new Set(folderKeys).size !== folderKeys.length;

      const foldersMissingScheduleOrClassification = Object.values(
        folders
      ).some((f) => {
        const folder = f as unknown as {
          schedule: string;
          classification: string;
        };
        return folder.schedule === "" || folder.classification === "";
      });

      const accAndAppExist =
        api.transfer.accessionExists(accession) &&
        api.transfer.applicationExists(application);
      const accAndAppAreValid =
        api.transfer.isAccessionValid(accession) &&
        api.transfer.isApplicationValid(application);

      if (!accAndAppExist)
        // Missing accession and/or application numbers.
        toastData = {
          success: false,
          title: "Missing accession and/or application number",
          message:
            "Your file list (ARS 662) is missing an accession and/or application number. Please add this information to the ‘admin’ property in the file list and save it, then try uploading the file again.",
        };

      if (hasDuplicates) {
        // File list has duplicate folders
        toastData = {
          success: false,
          title: "Duplicate folder",
          message:
            "Your file list (ARS 662) includes duplicate folders. Please remove duplicate folders from the ‘File List’ tab in the file list and save it, then try uploading the file again.",
        };
      }

      if (foldersMissingScheduleOrClassification) {
        // Folder is missing schedule and/or classification value.
        toastData = {
          success: false,
          title: "Missing schedule and/or classification value",
          message:
            "Your file list (ARS 662) is missing a schedule and/or classification value. Please review this information in the ‘File list’ tab of your file list and save it, then try uploading the file again.",
        };
      }

      if (accAndAppExist && !accAndAppAreValid)
        // Invalid accession and/or application numbers.
        toastData = {
          success: false,
          title: "Invalid accession and/or application number",
          message:
            "Your file list (ARS 662) has an invalid accession and/or application number. Please make sure to only use numbers (with the exception of a dash in the accession number). Please update this information and save it, then try uploading the file again.",
        };

      if (!folders || Object.keys(folders).length === 0)
        // Missing folders property.
        toastData = {
          success: false,
          title: "Missing folders",
          message:
            "Your file list (ARS 662) is missing the ‘folders’ property. Please add this information to the file list and save it, then try uploading the file again.",
        };

      if (toastData) {
        // Create a toast message
        setFileList(null);
        return toast.error(Toast, { data: toastData });
      }

      // Save results
      setAccession(accession);
      setApplication(application);
      setFoldersToProcess(
        Object.keys(folders).filter((folder) => folder.trim() !== "")
      );
    }
    return; // Return so linting doesnt complain about some paths not returning.
  };

  useEffect(() => {
    setCanLoseProgress(!!fileList);
    if (fileList) {
      const filename = fileList.name;
      const regex = /^(Digital_File_List|File\sList)/;
      if (!regex.test(filename)) {
        // Filename doesnt match regex
        toast.error(Toast, {
          data: {
            success: false,
            title: "Invalid filename",
            message:
              "Your Digital File List file name must begin with 'Digital_File_List' or 'File List'. Please review that you have selected the correct file, or rename the file, then try uploading the file again.",
          },
        });
        setFileList(null);
      }
    } else {
      // Clear state.
      setAccession(null);
      setApplication(null);
      setConfirmAccAppChecked(false);
      setFolders([]);
      setMetadata({});
      setExtendedMetadata({});
      setUploadSuccess(null);
      return;
    }
    parseFileList();
  }, [fileList]);

  useEffect(() => {
    if (transferForm) {
      const filename = transferForm.name;
      const regex = /^(Transfer_Form|617)/;
      if (!regex.test(filename)) {
        // Filename doesnt match regex
        toast.error(Toast, {
          data: {
            success: false,
            title: "Invalid filename",
            message:
              "Your Transfer Form ARS 617 file name must begin with 'Transfer_Form' or '617'. Please review that you have selected the correct file, or rename the file, then try uploading the file again.",
          },
        });
        setTransferForm(null);
      }
    }
  }, [transferForm]);

  useEffect(() => {
    if (uploadSuccess === true) {
      // Success
      toast.success(Toast, {
        data: {
          success: true,
          title: "Folder upload successful",
          message:
            "Please verify all loaded folders should be sent to records, delete those that shouldn't be, then proceed to the next step.",
        },
      });
    } else if (uploadSuccess === false) {
      // Failed to download transfer
      toast.error(Toast, {
        data: {
          success: false,
          title: "Folder upload unsuccessful",
          message:
            "One or more of your folders was not successfully uploaded due to an invalid folder path or empty folder. Update the folder path(s) by clicking the corresponding Edit icon or remove the folder by clicking the Delete icon. You may need to scroll within the table to locate the folders that have not loaded properly.",
        },
      });
    }
  }, [uploadSuccess]);

  // Toast message once folders have been successfully uploaded
  useEffect(() => {
    if (
      currentViewIndex === 3 &&
      folders.length > 0 &&
      folders.every(
        (folder) =>
          folder.bufferProgress === 100 && folder.metadataProgress === 100
      ) &&
      uploadSuccess !== true
    ) {
      setUploadSuccess(true);
    }
  }, [folders, currentViewIndex]);

  useEffect(() => {
    if (currentViewIndex === 3) {
      // Open of upload view
      if (
        folders.some((folder) => folder.invalidPath) &&
        uploadSuccess !== false
      ) {
        setUploadSuccess(false);
      }
    } else if (currentViewIndex === 4) {
      // Open of finish view
      setCanLoseProgress(false);
      handleSendRequest();
    }
  }, [currentViewIndex]);

  // Ask for justification of changes if any folder paths changed or deleted
  const handleLanUploadNextPress = () => {
    if (changes.length > 0) {
      // Folder paths changed or deleted
      setShowJustifyChangesModal(true);
    } else if (!accessToken) {
      // Prompt use to login
      setShowLoginRequiredModal(true);
    } else onNextPress();
  };

  const handleSendRequest = async () => {
    if (!fileList || !transferForm || !accessToken) return;

    // Request url
    const apiUrl = await api.getCurrentApiUrl();
    const requestUrl = `${apiUrl}/transfer/lan`;

    // Get updated folder metadata
    const updatedFolderList: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(originalFolderList)) {
      const change = changes.find((c) => c.originalFolderPath === key);
      if (change) {
        if (!change.deleted) {
          const newKey = change.newFolderPath ?? key;
          updatedFolderList[newKey] = value;
        }
      } else {
        updatedFolderList[key] = value;
      }
    }

    // Prepare metadata V2 for request body
    const metadataV2 = {
      admin: { accession, application },
      folders: updatedFolderList,
      files: metadata,
    };

    // Read static buffers
    const fileListBuffer = await api.utils.fileToBuffer(fileList);
    const transferFormBuffer = await api.utils.fileToBuffer(transferForm);

    // Normalize and reconstruct buffer structure
    const reconstructedBuffers: typeof folderBuffers = {};
    for (const [folder, files] of Object.entries(folderBuffers)) {
      reconstructedBuffers[folder] = files.map((file) => {
        const bufferUtils = api.transfer.createBufferUtils();
        const buffer = bufferUtils.normalize(file.buffer);

        return {
          filename: file.filename,
          path: file.path,
          buffer,
        };
      });
    }

    // Generate zipped chunks and checksum
    const { chunks: zipChunks, checksum: contentChecksum } =
      await api.transfer.createZippedChunks(reconstructedBuffers);
    const totalChunks = zipChunks.length;

    for (let i = 0; i < totalChunks; i++) {
      const chunk = zipChunks[i];
      const formData = new FormData();

      formData.append("fileListBuffer", new Blob([fileListBuffer]), "file.bin");
      formData.append("fileListFilename", fileList.name);
      formData.append(
        "transferFormBuffer",
        new Blob([transferFormBuffer]),
        "file.bin"
      );
      formData.append("transferFormFilename", transferForm.name);
      formData.append("contentZipChunk", new Blob([chunk]), "file.bin");
      formData.append("chunkIndex", i.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("contentChecksum", contentChecksum);
      formData.append("metadataV2", JSON.stringify(metadataV2));
      formData.append("extendedMetadata", JSON.stringify(extendedMetadata));
      formData.append("changes", JSON.stringify(changes));
      formData.append("changesJustification", changesJustification);

      try {
        const tokens = await refresh(); // Get new tokens before request
        console.log(`Uploading chunk ${i + 1} of ${totalChunks}`);
        const response = await fetch(requestUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${tokens?.accessToken}` },
          body: formData,
        });

        if (!response.ok) {
          console.error(`Upload failed for chunk ${i + 1}`);
          setRequestSuccessful(false);
          return;
        }

        const jsonResponse = await response.json();
        console.log("Lan transfer response:", jsonResponse);

        if (jsonResponse.success && i === totalChunks - 1) {
          setRequestSuccessful(true);
        }
      } catch (error) {
        console.error("Lan transfer error:", error);
        setRequestSuccessful(false);
        return;
      }
    }

    console.log("All chunks uploaded successfully.");
  };

  // Send to home on completion
  const handleCompletion = () => {
    setCanLoseProgress(false);
    navigate("/");
  };

  const handleRetrySubmission = () => {
    handleLogout();
    setRequestSuccessful(null);
    setCurrentViewIndex(3);
  };

  return (
    <Grid container sx={{ paddingBottom: "20px" }}>
      <Grid size={2} />
      <Grid size={8} sx={{ paddingTop: 3 }}>
        <Stack gap={3}>
          <Typography variant="h2">Send records from LAN Drive</Typography>
          <Stepper
            items={[
              "File list",
              "Transfer form",
              "Submission agreement",
              "Confirmation",
              "Finish",
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
              accession={accession!}
              application={application!}
              onNextPress={onNextPress}
              onBackPress={onBackPress}
            />
          )}
          {currentViewIndex === 3 && (
            <LanConfirmationView
              accession={accession!}
              application={application!}
              folders={folders}
              setFolders={setFolders}
              processRowUpdate={processRowUpdate}
              setMetadata={setMetadata}
              setChanges={setChanges}
              onFolderEdit={handleEditClick}
              onNextPress={handleLanUploadNextPress}
              onBackPress={onBackPress}
              handleShutdownWorker={handleShutdownWorker}
            />
          )}
          {currentViewIndex === 4 && (
            <FinishView
              accession={accession!}
              application={application!}
              wasRequestSuccessful={requestSuccessful}
              onNextPress={handleCompletion}
              handleRetrySubmission={handleRetrySubmission}
              isLan={true}
            />
          )}
          <JustifyChangesModal
            open={showJustifyChangesModal}
            onClose={() => setShowJustifyChangesModal(false)}
            explanation={changesJustification}
            setExplanation={setChangesJustification}
            onConfirm={() => {
              setShowJustifyChangesModal(false);
              if (!accessToken) {
                // Prompt user to login
                setShowLoginRequiredModal(true);
              } else onNextPress();
            }}
          />
          <LoginRequiredModal
            open={showLoginRequiredModal}
            onClose={() => setShowLoginRequiredModal(false)}
            onConfirm={() => {
              setShowLoginRequiredModal(false);
              api.sso.startLoginProcess();
            }}
          />
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
