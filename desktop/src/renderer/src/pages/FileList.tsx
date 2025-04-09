import { useAuth, useFolderList, useNavigate } from "@/hooks";
import { Box, Grid2 as Grid, Stack, Typography } from "@mui/material";
import { useGridApiRef } from "@mui/x-data-grid";
import { Instruction, LoginRequiredModal, Toast } from "@renderer/components";
import {
  AccAppCheck,
  ContinueButton,
  FinalizeFilelistModal,
  FolderDisplayGrid,
  type FolderRow,
  ReturnToHomeModal,
  SelectFolderButton,
} from "@renderer/components/file-list";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const FileListPage = () => {
  const [api] = useState(window.api); // Preload scripts

  const [continueButtonIsEnabled, setContinueButtonIsEnabled] =
    useState<boolean>(false);
  const [accAppCheckIsEnabled, setAccAppCheckIsEnabled] =
    useState<boolean>(false);
  const [finalizeModalIsOpen, setFinalizeModalIsOpen] =
    useState<boolean>(false);
  const [returnHomeModalIsOpen, setReturnHomeModalIsOpen] =
    useState<boolean>(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [hasAccApp, setHasAccApp] = useState<boolean | null>(null);

  const { navigate, setCanLoseProgress } = useNavigate();

  const { idToken, accessToken } = useAuth();

  const authenticated = !!accessToken;

  const handleLogout = async () => await api.sso.logout(idToken);

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

    setFinalizeModalIsOpen(isOpen);
  }, [continueButtonIsEnabled]);

  const handleFinalizeModalClose = useCallback(() => {
    setFinalizeModalIsOpen(false);
  }, []);

  const handleReturnHomeModalClose = useCallback(() => {
    setReturnHomeModalIsOpen(false);
  }, []);

  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        await submit(formData);
        setFinalizeModalIsOpen(false);
        setReturnHomeModalIsOpen(true);
      } catch (error) {
        console.error(error);
        handleLogout();
        setFinalizeModalIsOpen(false);
        toast.error(Toast, {
          data: {
            success: false,
            title: "Submission failed",
            message:
              "We were unable to fulfill your request to create a file list. Please try again.",
          },
        });
      }
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
    setCanLoseProgress(hasFolders);

    setAccAppCheckIsEnabled(hasFolders);
    if (!hasFolders) setHasAccApp(null);

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
            <Typography variant="h3">Instructions</Typography>
            <Instruction
              num={1}
              instruction="Click the “Add folder(s)” button to start adding folders to your file list"
              required={true}
              desc="Tip: Upload multiple folders at once by selecting several folders in the file explorer window, or by clicking “Add Folder(s)” again while a previously added folder is in progress."
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
          <FinalizeFilelistModal
            open={finalizeModalIsOpen}
            onClose={handleFinalizeModalClose}
            onSubmit={handleFormSubmit}
            hasAccApp={hasAccApp ?? false}
          />
          <ReturnToHomeModal
            open={returnHomeModalIsOpen}
            onClose={handleReturnHomeModalClose}
            setCurrentPath={(path) => navigate(path)}
          />
        </Stack>
      </Grid>
      <Grid size={0.5} />
    </Grid>
  );
};
