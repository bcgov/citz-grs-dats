import { Button } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";
import { ConfirmationTable } from "./ConfirmationTable/ConfirmationTable";

type Props = {
  accession: string;
  application: string;
  bufferProgress: number;
  folderPath: string;
  onNextPress: () => void;
  onBackPress: () => void;
};

export const EdrmsConfirmationView = ({
  accession,
  application,
  bufferProgress,
  folderPath,
  onNextPress,
  onBackPress,
}: Props) => {
  return (
    <Stack gap={3}>
      <Stack gap={2}>
        <Typography variant="h3">Instructions</Typography>
        <Typography>
          Please wait while DATS automatically loads the folder associated with
          your transfer. Once it is successfully loaded proceed to the next
          step. If these EDRMS records are part of a current audit, FOI request,
          or legal case please cancel this process and contact the GIM Branch.
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
        <ConfirmationTable
          bufferProgress={bufferProgress}
          folderPath={folderPath}
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
          isDisabled={bufferProgress !== 100}
          style={{ width: "fit-content" }}
        >
          Next
        </Button>
      </Box>
    </Stack>
  );
};
