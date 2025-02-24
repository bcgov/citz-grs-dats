import { useFolderList } from "@/hooks";
import { Box, Stack, Typography, Grid2 as Grid } from "@mui/material";
import { useGridApiRef } from "@mui/x-data-grid";
import {
  AccAppCheck,
  ContinueButton,
  ContinueModal,
  FolderDisplayGrid,
  type FolderRow,
  Instruction,
  SelectFolderButton,
} from "@renderer/components/file-list";
import { useCallback, useContext, useEffect, useState } from "react";
import { Context } from "../App";
import { LoginRequiredModal } from "@renderer/components";

export const FileListPage = () => {
  const [api] = useState(window.api); // Preload scripts

  const [continueButtonIsEnabled, setContinueButtonIsEnabled] =
    useState<boolean>(false);
  const [accAppCheckIsEnabled, setAccAppCheckIsEnabled] =
    useState<boolean>(false);
  const [continueModalIsOpen, setContinueModalIsOpen] =
    useState<boolean>(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [hasAccApp, setHasAccApp] = useState<boolean | null>(null);

  const { accessToken, setCurrentPath, setProgressMade } = useContext(Context);
  const authenticated = !!accessToken;

  const apiRef = useGridApiRef();
  const {
    folders,
    setFolders,
    setMetaData,
    setExtendedMetaData,
    addPathArrayToFolders,
    removeFolder,
    submit,
  } = useFolderList({ accessToken });

  const handleProgress = useCallback(
    (event: CustomEvent<{ source: string; progressPercentage: number }>) => {
      const { source, progressPercentage } = event.detail;
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
      } else {
        console.error(`Failed to process folder: ${source}`);
      }
    },
    [setMetaData, setExtendedMetaData]
  );

  const handleRowUpdate = useCallback(
    (newFolder: FolderRow) => {
      setFolders((prevFolderList) =>
        prevFolderList.map((folder) =>
          folder.id === newFolder.id ? newFolder : folder
        )
      );
      return newFolder;
    },
    [setFolders]
  );

  const handleOpenContinueModel = useCallback(() => {
    let isOpen = true;

    if (!continueButtonIsEnabled) isOpen = false;

    setContinueModalIsOpen(isOpen);
  }, [continueButtonIsEnabled]);

  const handleClose = useCallback(() => {
    setContinueModalIsOpen(false);
  }, []);

  const handleFormSubmit = useCallback(
    (formData) => {
      submit(formData);
    },
    [submit]
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

    return () => {
      window.removeEventListener(
        "folder-metadata-progress",
        handleProgress as EventListener
      );
      window.removeEventListener(
        "folder-metadata-completion",
        handleCompletion as EventListener
      );
    };
  }, [handleCompletion, handleProgress]);

  useEffect(() => {
    const allFoldersProcessed = folders.every(
      (folder) => folder.progress === 100
    );
    const hasFolders = folders.length > 0;

    // Update progress when folders are uploaded.
    setProgressMade(hasFolders);

    setAccAppCheckIsEnabled(allFoldersProcessed && hasFolders);

    // Enable continue button when folders are processed.
    setContinueButtonIsEnabled(
      allFoldersProcessed && hasFolders && authenticated && hasAccApp !== null
    );
  }, [folders, authenticated, hasAccApp]);

  return (
    <Grid container>
      <Grid size={0.5} />
      <Grid size={11} sx={{ paddingTop: 3 }}>
        <Stack gap={2}>
          <Typography variant="h2">Create file list</Typography>

          <Stack gap={2}>
            <Typography variant="h4">Instructions</Typography>
            <Instruction
              num={1}
              instruction="Click the “Add folder(s)” button to start adding folders to your file list"
              required={true}
              tip="Upload multiple folders at once by selecting several folders in the file explorer window, or by clicking “upload folder(s)” again while a previously added folder is in progress."
            />
            <Instruction
              num={2}
              instruction="Provide additional information about your folder(s) in the columns provided or, if preferred, do it later in Excel"
              required={false}
            />
            <Instruction
              num={3}
              instruction="Remove any unwanted folders by clicking the delete icon"
              required={false}
            />
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <SelectFolderButton
              onRowChange={(inputPaths) =>
                addPathArrayToFolders(inputPaths, apiRef)
              }
            />
          </Box>

          <FolderDisplayGrid
            rows={folders}
            onFolderDelete={removeFolder}
            processRowUpdate={handleRowUpdate}
            apiRef={apiRef}
          />

          <AccAppCheck
            hasAccApp={hasAccApp}
            setHasAccApp={setHasAccApp}
            enabled={accAppCheckIsEnabled}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <ContinueButton
              onContinue={handleOpenContinueModel}
              isEnabled={continueButtonIsEnabled}
            />
          </Box>

          <LoginRequiredModal
            open={showLoginRequiredModal}
            onClose={() => setShowLoginRequiredModal(false)}
            onConfirm={() => {
              setShowLoginRequiredModal(false);
              api.sso.startLoginProcess();
            }}
          />
          <ContinueModal
            modalOpen={continueModalIsOpen}
            modalClose={handleClose}
            modalSubmit={handleFormSubmit}
            setCurrentPath={setCurrentPath}
          />
        </Stack>
      </Grid>
      <Grid size={0.5} />
    </Grid>
  );
};
