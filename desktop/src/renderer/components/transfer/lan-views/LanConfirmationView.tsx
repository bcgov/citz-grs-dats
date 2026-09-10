import { Button } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";
import { FolderUploadGrid } from "../UploadGrid";
import { useGridApiRef } from "@mui/x-data-grid";
import { ProcessingAlert } from "@renderer/components";

type Folder = {
  id: number;
  folder: string;
  invalidPath: boolean;
  bufferProgress: number;
  metadataProgress: number;
  metadataFailed: boolean;
  bufferFailed: boolean;
};

type Change = {
  originalFolderPath: string;
  newFolderPath?: string;
  deleted: boolean;
};

type FolderMessage = { metadata: string | null; copy: string | null };

type Props = {
  accession: string;
  application: string;
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  setMetadata: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  setChanges: React.Dispatch<React.SetStateAction<Change[]>>;
  folderMessages: Record<string, FolderMessage>;
  globalMessage: string | null;
  setFolderMessages: React.Dispatch<React.SetStateAction<Record<string, FolderMessage>>>;
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
  folderMessages,
  globalMessage,
  setFolderMessages,
  onNextPress,
  processRowUpdate,
  onBackPress,
  onFolderEdit,
  handleShutdownWorker,
}: Props) => {
  const apiRef = useGridApiRef();

  const onFolderDelete = (folder: string) => {
    handleShutdownWorker(folder);
    window.api.deleteMetadataState(folder);
    setFolders((prevRows) => prevRows.filter((row) => row.folder !== folder));
    setMetadata((prevMetadata) => {
      const { [folder]: _, ...remainingMetadata } = prevMetadata;
      return remainingMetadata;
    });
    setFolderMessages((prev) => {
      const { [folder]: _, ...remaining } = prev;
      return remaining;
    });
    setChanges((prev) => {
      const existingItemWithNewPath = prev.find(
        (c) => c.newFolderPath === folder
      );
      const existingItemWithOriginalPath = prev.find(
        (c) => c.originalFolderPath === folder
      );

      if (existingItemWithNewPath) {
        return [...prev, { ...existingItemWithNewPath, deleted: true }];
      }
      if (existingItemWithOriginalPath) {
        return [...prev, { ...existingItemWithOriginalPath, deleted: true }];
      }
      return [...prev, { originalFolderPath: folder, deleted: true }];
    });
    console.log(`Deleted folder: ${folder}`);
  };

  const disableNext =
    !folders.every(
      (folder) => folder.metadataProgress + folder.bufferProgress === 200
    ) || folders.length === 0;

  // Build combined status message from folderMessages
  const activeMessages = Object.entries(folderMessages)
    .filter(([, msg]) => msg.metadata || msg.copy)
    .map(([, msg]) => {
      const parts: string[] = [];
      if (msg.metadata) parts.push(msg.metadata);
      if (msg.copy) parts.push(msg.copy);
      return parts.join(", ");
    });

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
            <b>Accession:</b> {accession}
          </Typography>
          <Typography>
            <b>Application:</b> {application}
          </Typography>
        </Stack>
        {activeMessages.length > 0 && (
          <Stack gap={0.5}>
            {activeMessages.map((msg) => (
              <ProcessingAlert key={msg} message={msg} />
            ))}
          </Stack>
        )}
        {globalMessage && activeMessages.length === 0 && (
          <ProcessingAlert message={globalMessage} />
        )}
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
