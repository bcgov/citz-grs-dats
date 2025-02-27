import { Button } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";

type Props = {
  accession: string;
  application: string;
  onNextPress: () => void;
  isLan: boolean;
};

export const RequestSuccess = ({
  accession,
  application,
  onNextPress,
  isLan,
}: Props) => {
  return (
    <Stack gap={3}>
      <Stack gap={2}>
        <Typography variant="h3">Success!</Typography>
        <Typography>
          You have successfully sent records to the Digital Archives for the
          following transfer:
        </Typography>
        <Stack direction="row" gap={4}>
          <Typography>
            <b>Accession #:</b> {accession}
          </Typography>
          <Typography>
            <b>Application #:</b> {application}
          </Typography>
        </Stack>
        <Stack>
          <Typography>
            You will receive a confirmation email shortly. Your confirmation
            email will contain:
          </Typography>
          <ul>
            <li>
              {isLan ? "An updated" : "A courtesy"} copy of the digital file
              list (ARS 662).
            </li>
            <li>A copy of the submission agreement.</li>
            <li>Instructions for next steps.</li>
          </ul>
        </Stack>
        <Typography variant="h3">Next steps</Typography>
        <Typography>
          Your transfer will be processed by an archivist. They will contact you
          with next steps. Please continue to hold the records on the{" "}
          {isLan ? "LAN drive" : "EDRMS"} until you receive further instruction.
        </Typography>
      </Stack>
      <Box sx={{ display: "flex", justifyContent: "right" }}>
        <Button onPress={onNextPress} style={{ width: "fit-content" }}>
          Finish
        </Button>
      </Box>
    </Stack>
  );
};
