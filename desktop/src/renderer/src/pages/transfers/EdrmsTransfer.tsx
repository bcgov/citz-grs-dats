import { Grid2 as Grid, Stack, Typography } from "@mui/material";
import { Stepper, Toast } from "@renderer/components";
import {
  EdrmsConfirmationView,
  EdrmsSubmissionAgreementView,
  EdrmsUploadDataportView,
  EdrmsUploadFilelistView,
  EdrmsUploadFolderView,
  EdrmsUploadTransferFormView,
} from "@renderer/components/transfer/edrms-views";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../../App";

export const EdrmsTransferPage = () => {
  const [api] = useState(window.api); // Preload scripts

  const { setCurrentPath } = useContext(Context) ?? {};

  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [folderPath, setFolderPath] = useState<string | null | undefined>(null);
  const [fileList, setFileList] = useState<File | null | undefined>(undefined);
  const [fileListFoundInEdrms, setFileListFoundInEdrms] =
    useState<boolean>(false);
  const [dataportFile, setDataportFile] = useState<File | null | undefined>(
    undefined
  );
  const [dataportFoundInEdrms, setDataportFoundInEdrms] =
    useState<boolean>(false);
  const [transferForm, setTransferForm] = useState<File | null | undefined>(
    undefined
  );
  const [transferFormFoundInEdrms, setTransferFormFoundInEdrms] =
    useState<boolean>(false);
  const [dataportJson, setDataportJson] = useState<
    Record<string, string>[] | null
  >(null);
  const [metadata, setMetadata] = useState<Record<string, unknown>>({});

  // Pulled from dataport file
  const [accession, setAccession] = useState<string | undefined | null>(null);
  const [application, setApplication] = useState<string | undefined | null>(
    null
  );

  // User confirms if accession & application are correct
  const [confirmAccAppChecked, setConfirmAccAppChecked] =
    useState<boolean>(false);

  // Buffer progress
  const [bufferProgress, setBufferProgress] = useState<number>(0);
  const [folderBuffers, setFolderBuffers] = useState<
    Record<string, FileBufferObj[]>
  >({});

  const onNextPress = () => {
    setCurrentViewIndex((prev) => prev + 1);
  };

  const onBackPress = () => {
    setCurrentViewIndex((prev) => prev - 1);
  };

  // Handle buffer progress and completion events
  useEffect(() => {
    const handleProgress = (
      event: CustomEvent<{ source: string; progressPercentage: number }>
    ) => {
      const { source, progressPercentage } = event.detail;
      console.log(`${source} buffer progress ${progressPercentage}`);
      // Update folder progress
      const currentProgress = bufferProgress;

      if (currentProgress !== 100) setBufferProgress(progressPercentage);
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
      "folder-buffer-completion",
      handleCompletion as EventListener
    );

    return () => {
      window.removeEventListener(
        "folder-buffer-progress",
        handleProgress as EventListener
      );
      window.removeEventListener(
        "folder-buffer-completion",
        handleCompletion as EventListener
      );
    };
  }, []);

  const parseEdrmsFiles = async (folderPath: string) => {
    const {
      dataport: parsedDataport,
      fileList: parsedFileList,
      transferForm: parsedTransferForm,
    } = await api.transfer.parseEdrmsFiles(folderPath);
    // Dataport found
    if (parsedDataport && !dataportFile) {
      setDataportFile(parsedDataport);
      setDataportFoundInEdrms(true);
    }
    // Filelist found
    if (parsedFileList && !fileList) {
      setFileList(parsedFileList);
      setFileListFoundInEdrms(true);
    }
    // Transfer form found
    if (parsedTransferForm && !transferForm) {
      setTransferForm(parsedTransferForm);
      setTransferFormFoundInEdrms(true);
    }
  };

  const parseDataport = async (dataportFile: File) => {
    // Parse file to json
    try {
      const dataportJson = await api.transfer.parseTabDelimitedTxt(
        dataportFile
      );
      setDataportJson(dataportJson);

      if (!folderPath)
        throw new Error("Missing folder path while parsing dataport file.");

      // Parse json into admin, folders, and files metadata
      const metadata = await api.transfer.parseDataportJsonMetadata(
        dataportJson,
        folderPath
      );
      setMetadata(metadata);
      setAccession(metadata.admin.accession);
      setApplication(metadata.admin.application);
    } catch (error) {
      console.error(error);
      toast.error(Toast, {
        data: {
          title: "Dataport parse failed",
          message:
            "Your dataport file could not be parsed. Please be sure to only upload dataport files generated by the EDRMS system.",
        },
      });
      setDataportFile(null);
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

  useEffect(() => {
    if (folderPath) {
      // Check for edrms files when a new folder is chosen
      parseEdrmsFiles(folderPath);
      // Copy buffers from folder
      getFolderBuffer(folderPath);
    } else {
      // Reset
      setFolderBuffers({});
    }
  }, [folderPath]);

  useEffect(() => {
    if (dataportFile) {
      parseDataport(dataportFile);
    } else {
      // Reset
      setDataportFoundInEdrms(false);
      setMetadata({});
      setDataportJson(null);
      setAccession(null);
      setApplication(null);
      setConfirmAccAppChecked(false);
    }
  }, [dataportFile]);

  useEffect(() => {
    if (!fileList) {
      // Reset
      setFileListFoundInEdrms(false);
    }
  }, [fileList]);

  useEffect(() => {
    if (!transferForm) {
      // Reset
      setTransferFormFoundInEdrms(false);
    }
  }, [transferForm]);

  useEffect(() => {
    if (currentViewIndex === 1) {
      // Open of upload dataport view
      if (dataportFoundInEdrms) {
        toast.success(Toast, {
          data: {
            title: "Dataport file detected",
            message:
              "We have automatically populated your dataport file by scanning the EDRMS folder you uploaded in the previous step.",
          },
        });
      }
    } else if (currentViewIndex === 2) {
      // Open of upload filelist view
      if (fileListFoundInEdrms) {
        toast.success(Toast, {
          data: {
            title: "Filelist file detected",
            message:
              "We have automatically populated your filelist file by scanning the EDRMS folder you uploaded in the previous step.",
          },
        });
      }
    } else if (currentViewIndex === 3) {
      // Open of upload transfer form view
      if (transferFormFoundInEdrms) {
        toast.success(Toast, {
          data: {
            title: "Transfer form detected",
            message:
              "We have automatically populated your transfer form by scanning the EDRMS folder you uploaded in the previous step.",
          },
        });
      }
    }
  }, [currentViewIndex]);

  return (
    <Grid container sx={{ paddingBottom: "20px" }}>
      <Grid size={2} />
      <Grid size={8} sx={{ paddingTop: 3 }}>
        <Stack gap={2}>
          <Typography variant="h2">Send records from EDRMS</Typography>
          <Stepper
            items={[
              "EDRMS folder",
              "Dataport file",
              "File list",
              "Transfer form",
              "Submission agreement",
              "Confirmation",
              "Finish",
            ]}
            currentIndex={currentViewIndex}
          />
          {currentViewIndex === 0 && (
            <EdrmsUploadFolderView
              folderPath={folderPath}
              setFolderPath={setFolderPath}
              onNextPress={onNextPress}
            />
          )}
          {currentViewIndex === 1 && (
            <EdrmsUploadDataportView
              file={dataportFile}
              setFile={setDataportFile}
              accession={accession}
              application={application}
              confirmChecked={confirmAccAppChecked}
              setConfirmChecked={setConfirmAccAppChecked}
              onNextPress={onNextPress}
              onBackPress={onBackPress}
            />
          )}
          {currentViewIndex === 2 && (
            <EdrmsUploadFilelistView
              file={fileList}
              setFile={setFileList}
              onNextPress={onNextPress}
              onBackPress={onBackPress}
            />
          )}
          {currentViewIndex === 3 && (
            <EdrmsUploadTransferFormView
              file={transferForm}
              setFile={setTransferForm}
              onNextPress={onNextPress}
              onBackPress={onBackPress}
            />
          )}
          {currentViewIndex === 4 && (
            <EdrmsSubmissionAgreementView
              accession={accession!}
              application={application!}
              onNextPress={onNextPress}
              onBackPress={onBackPress}
              setCurrentPath={setCurrentPath}
            />
          )}
          {currentViewIndex === 5 && (
            <EdrmsConfirmationView
              accession={accession!}
              application={application!}
              bufferProgress={bufferProgress}
              folderPath={folderPath!}
              onNextPress={onNextPress}
              onBackPress={onBackPress}
            />
          )}
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
