import { Button } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";
import { FolderUploadGrid } from "../UploadGrid";
import { useGridApiRef } from "@mui/x-data-grid";

type Folder = {
  id: number;
  folder: string;
  invalidPath: boolean;
  bufferProgress: number;
  metadataProgress: number;
};

type Change = {
  originalFolderPath: string;
  newFolderPath?: string;
  deleted: boolean;
};

type Props = {
  accession: string;
  application: string;
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  setMetadata: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  setChanges: React.Dispatch<React.SetStateAction<Change[]>>;
  processRowUpdate: (newFolder: Folder) => Folder;
  onFolderEdit: (folder: string) => void;
  onNextPress: () => void;
  onBackPress: () => void;
  handleShutdownWorker: (folder: string) => Promise<void>;
};

export const LanConfirmationView = ({
  accession,
  application,
  folders,
  setFolders,
  setMetadata,
  setChanges,
  onNextPress,
  processRowUpdate,
  onBackPress,
  onFolderEdit,
  handleShutdownWorker,
}: Props) => {
  const apiRef = useGridApiRef();

  const onFolderDelete = (folder: string) => {
    handleShutdownWorker(folder);
    setFolders((prevRows) => prevRows.filter((row) => row.folder !== folder));
    setMetadata((prevMetadata) => {
      const { [folder]: _, ...remainingMetadata } = prevMetadata; // Remove the deleted folder
      return remainingMetadata;
    });
    setChanges((prev) => {
      const existingItemWithNewPath = prev.find(
        (c) => c.newFolderPath === folder
      );
      const existingItemWithOriginalPath = prev.find(
        (c) => c.originalFolderPath === folder
      );

      if (existingItemWithNewPath) {
        // Folder exists in changes already, path was previously changed
        return [...prev, { ...existingItemWithNewPath, deleted: true }];
      }
      if (existingItemWithOriginalPath) {
        // Folder exists in changes already
        return [...prev, { ...existingItemWithOriginalPath, deleted: true }];
      }
      // Add new item
      return [...prev, { originalFolderPath: folder, deleted: true }];
    });
    console.log(`Deleted folder: ${folder}`);
  };

  const disableNext =
    !folders.every(
      (folder) => folder.metadataProgress + folder.bufferProgress === 200
    ) || folders.length === 0;

  return (
    <Stack gap={3}>
      <Stack gap={3}>
        <Typography variant="h3">Instructions</Typography>
        <Typography>
          Please wait while DATS automatically loads the folders associated with
          your transfer. Once all folders are successfully loaded, verify the
          status before proceeding to the next step. If any folders are part of
          a current audit, FOI request, or legal case please remove them from
          the list before proceeding.
        </Typography>
        <Typography variant="h3" sx={{ marginTop: 1 }}>
          Transfer details
        </Typography>
        <Stack direction="row" gap={4}>
          <Typography>
            <b>Accession #:</b> {accession}
          </Typography>
          <Typography>
            <b>Application #:</b> {application}
          </Typography>
        </Stack>
        <FolderUploadGrid
          rows={folders}
          apiRef={apiRef}
          onFolderDelete={onFolderDelete}
          onFolderEdit={onFolderEdit}
          processRowUpdate={processRowUpdate}
        />
      </Stack>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="secondary"
          onPress={onBackPress}
          style={{ width: "fit-content" }}
        >
          Back
        </Button>
        <Button
          onPress={onNextPress}
          isDisabled={disableNext}
          style={{ width: "fit-content" }}
        >
          Next
        </Button>
      </Box>
    </Stack>
  );
};
