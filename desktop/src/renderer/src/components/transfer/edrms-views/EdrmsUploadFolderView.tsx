import { Button } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";
import { FolderUploadArea } from "@renderer/components";

type Props = {
  folderPath?: string | null;
  setFolderPath: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
  onNextPress: () => void;
};

export const EdrmsUploadFolderView = ({
  folderPath,
  setFolderPath,
  onNextPress,
}: Props) => {
  const onChange = (folderPath: string | null | undefined) => {
    if (folderPath) setFolderPath(folderPath);
  };

  const onDelete = () => setFolderPath(undefined);

  return (
    <Stack gap={3}>
      <Stack gap={3}>
        <Typography variant="h3">Upload your EDRMS folder here:</Typography>
        <FolderUploadArea
          folderPath={folderPath}
          onChange={onChange}
          onDelete={onDelete}
        />
      </Stack>
      <Box sx={{ display: "flex", justifyContent: "right" }}>
        <Button
          onPress={onNextPress}
          isDisabled={!folderPath}
          style={{ width: "fit-content" }}
        >
          Next
        </Button>
      </Box>
    </Stack>
  );
};
