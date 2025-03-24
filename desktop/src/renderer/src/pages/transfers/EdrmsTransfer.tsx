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
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../../App";
import { FinishView } from "@renderer/components/transfer/finish-view";
import { calculateChecksum } from "./utils";

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB (OpenShift limitation at about 100MB)

export const EdrmsTransferPage = () => {
  const [api] = useState(window.api); // Preload scripts

  const { idToken, accessToken, setCurrentPath, setProgressMade } =
    useContext(Context) ?? {};

  const handleLogout = async () => await api.sso.logout(idToken);

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

  // Request to send transfer
  const [requestSuccessful, setRequestSuccessful] = useState<boolean | null>(
    null
  );

  // Allows buffer collection to use metadata without issues of stale state
  const metadataRef = useRef(metadata);

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
        let folderBuffers = {};

        buffers.forEach((buffer) => {
          const bufferFilename = buffer.filename;
          const fileMetadata = metadataRef.current.files as Record<
            string,
            unknown[]
          >;
          let fileFound = false;

          // Find file match in metadata.files
          Object.entries(fileMetadata as Record<string, unknown[]>).forEach(
            ([folderName, value]) => {
              const file = value.find(
                (f) => (f as { filename: string }).filename === bufferFilename
              ) as { filename: string };

              if (file && !fileFound) {
                folderBuffers = {
                  ...folderBuffers,
                  [folderName]: [...(folderBuffers[folderName] ?? []), buffer],
                };
                fileFound = true;
              }
            }
          );
        });

        setFolderBuffers(folderBuffers);
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
          success: false,
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
    setProgressMade(!!folderPath);
    if (folderPath) {
      // Check for edrms files when a new folder is chosen
      parseEdrmsFiles(folderPath);
    }
  }, [folderPath]);

  useEffect(() => {
    if (folderPath && metadata.files) {
      // After metadata has been collected
      metadataRef.current = metadata;
      // Copy buffers from folder
      getFolderBuffer(folderPath);
    }
  }, [metadata.files]);

  useEffect(() => {
    if (dataportFile) {
      parseDataport(dataportFile);
    } else {
      // Reset
      setDataportFoundInEdrms(false);
      setMetadata({});
      metadataRef.current = {};
      setFolderBuffers({});
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
    } else {
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
            success: true,
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
            success: true,
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
            success: true,
            title: "Transfer form detected",
            message:
              "We have automatically populated your transfer form by scanning the EDRMS folder you uploaded in the previous step.",
          },
        });
      }
    } else if (currentViewIndex === 6) {
      // Open of finish view
      handleSendRequest();
    }
  }, [currentViewIndex]);

  const handleSendRequest = async () => {
    if (!dataportFile || !fileList || !transferForm || !accessToken) return;

    // Request URL
    const apiUrl = await api.getCurrentApiUrl();
    const requestUrl = `${apiUrl}/transfer/edrms`;

    // Prepare file buffers
    const dataportBuffer = await api.utils.fileToBuffer(dataportFile);
    const fileListBuffer = await api.utils.fileToBuffer(fileList);
    const transferFormBuffer = await api.utils.fileToBuffer(transferForm);
    const contentBuffer = await api.transfer.createZipBuffer(folderBuffers);

    // Calculate checksum of full zip
    const contentChecksum = await calculateChecksum(contentBuffer);

    // Chunking logic
    const totalChunks = Math.ceil(contentBuffer.byteLength / CHUNK_SIZE);

    for (let index = 0; index < totalChunks; index++) {
      const start = index * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, contentBuffer.byteLength);
      const chunkBuffer = contentBuffer.slice(start, end);

      // Create FormData per chunk
      const formData = new FormData();
      formData.append("dataportBuffer", new Blob([dataportBuffer]), "file.bin");
      formData.append("dataportFilename", dataportFile.name);
      formData.append("fileListBuffer", new Blob([fileListBuffer]), "file.bin");
      formData.append("fileListFilename", fileList.name);
      formData.append(
        "transferFormBuffer",
        new Blob([transferFormBuffer]),
        "file.bin"
      );
      formData.append("transferFormFilename", transferForm.name);
      formData.append("contentZipChunk", new Blob([chunkBuffer]), "file.bin");
      formData.append("chunkIndex", index.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("contentChecksum", contentChecksum);
      formData.append("metadata", JSON.stringify(metadata));
      formData.append(
        "extendedMetadata",
        JSON.stringify({ folders: dataportJson })
      );

      // Upload the chunk
      try {
        console.log(`Uploading chunk ${index + 1} of ${totalChunks}`);
        const response = await fetch(requestUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          setRequestSuccessful(false);
          return;
        }

        const jsonResponse = await response.json();
        console.log("EDRMS transfer response:", jsonResponse);

        if (jsonResponse.success && index === totalChunks - 1) {
          setRequestSuccessful(true);
        }
      } catch (error) {
        console.error("EDRMS transfer error:", error);
        setRequestSuccessful(false);
      }
    }

    console.log("All EDRMS chunks uploaded successfully.");
  };

  // Send to home on completion
  const handleCompletion = () => {
    if (setCurrentPath) setCurrentPath("/");
  };

  const handleRetrySubmission = () => {
    handleLogout();
    setRequestSuccessful(null);
    setCurrentViewIndex(5);
  };

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
          {currentViewIndex === 6 && (
            <FinishView
              accession={accession!}
              application={application!}
              wasRequestSuccessful={requestSuccessful}
              onNextPress={handleCompletion}
              setCurrentPath={setCurrentPath}
              handleRetrySubmission={handleRetrySubmission}
              isLan={false}
            />
          )}
        </Stack>
      </Grid>
      <Grid size={2} />
    </Grid>
  );
};
