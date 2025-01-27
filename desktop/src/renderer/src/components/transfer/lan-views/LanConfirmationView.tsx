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

type Props = {
  accession: string;
  application: string;
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  setMetadata: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  setDeletedFolders: React.Dispatch<React.SetStateAction<string[]>>;
  processRowUpdate: (newFolder: Folder) => Folder;
  onFolderEdit: (folder: string) => void;
  onNextPress: () => void;
  onBackPress: () => void;
};

export const LanConfirmationView = ({
  accession,
  application,
  folders,
  setFolders,
  setMetadata,
  setDeletedFolders,
  onNextPress,
  processRowUpdate,
  onBackPress,
  onFolderEdit,
}: Props) => {
  const apiRef = useGridApiRef();

  const onFolderDelete = (folder: string) => {
    setFolders((prevRows) => prevRows.filter((row) => row.folder !== folder));
    setMetadata((prevMetadata) => {
      const { [folder]: _, ...remainingMetadata } = prevMetadata; // Remove the deleted folder
      return remainingMetadata;
    });
    setDeletedFolders((prev) => [...prev, folder]);
    console.log(`Deleted folder: ${folder}`);
  };

  const disableNext = !folders.every(
    (folder) => folder.metadataProgress + folder.bufferProgress === 200
  );

  return (
    <Stack gap={3}>
      <Stack gap={2}>
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
