import { Button } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";
import { FileUploadArea, Stepper } from "@renderer/components";
import { AccAppConfirmation } from "../AccAppConfirmation";

type Props = {
  file?: File;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  accession?: string | null;
  application?: string | null;
  confirmChecked: boolean;
  setConfirmChecked: React.Dispatch<React.SetStateAction<boolean>>;
  onNextPress: () => void;
};

export const LanUploadFileListView = ({
  file,
  setFile,
  accession,
  application,
  confirmChecked,
  setConfirmChecked,
  onNextPress,
}: Props) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const onDrop = (file: File | null) => {
    if (file) setFile(file);
  };

  const onDelete = () => setFile(undefined);

  return (
    <Stack gap={3}>
      <Typography variant="h2">Send records from LAN Drive</Typography>
      <Stack gap={2}>
        <Stepper
          items={[
            "Upload digital file list (ARS 662)",
            "Upload transfer form (ARS 617)",
            "Submission agreement",
            "Folder upload",
            "Confirmation",
          ]}
          currentIndex={0}
        />
        <Typography variant="h3">
          Upload your digital file list (ARS 662) here:
        </Typography>
        <FileUploadArea
          file={file}
          onChange={onChange}
          onDrop={onDrop}
          onDelete={onDelete}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/json"
        />
        <AccAppConfirmation
          message="Based on the file list you provided:"
          accession={accession}
          application={application}
          checked={confirmChecked}
          setChecked={setConfirmChecked}
        />
      </Stack>
      <Box sx={{ display: "flex", justifyContent: "right" }}>
        <Button
          onPress={onNextPress}
          isDisabled={!file || !confirmChecked}
          style={{ width: "fit-content" }}
        >
          Next
        </Button>
      </Box>
    </Stack>
  );
};
