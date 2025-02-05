import { Button } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";
import { FileUploadArea } from "@renderer/components";

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
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const onDrop = (file: File | null | undefined) => {
    if (file) setFile(file);
  };

  const onDelete = () => setFile(undefined);

  return (
    <Stack gap={3}>
      <Stack gap={2}>
        <Typography variant="h3">Upload your EDRMS folder here:</Typography>
        <FileUploadArea
          file={file}
          onChange={onChange}
          onDrop={onDrop}
          onDelete={onDelete}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/json"
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
