import { Button } from "@bcgov/design-system-react-components";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";

type Props = {
  accession: string;
  application: string;
  wasRequestSuccessful: boolean | null;
  onNextPress: () => void;
};

export const LanFinishView = ({
  accession,
  application,
  wasRequestSuccessful,
  onNextPress,
}: Props) => {
  return (
    <>
      {wasRequestSuccessful ? (
        // Send records was successful
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
                <li>An updated copy of the digital file list (ARS 662).</li>
                <li>A copy of the submission agreement.</li>
                <li>Instructions for next steps.</li>
              </ul>
            </Stack>
            <Typography variant="h3">Next steps</Typography>
            <Typography>
              Your transfer will be processed by an archivist. They will contact
              you with next steps. Please continue to hold the records on the
              LAN drive until you receive further instruction.
            </Typography>
          </Stack>
          <Box sx={{ display: "flex", justifyContent: "right" }}>
            <Button onPress={onNextPress} style={{ width: "fit-content" }}>
              Finish
            </Button>
          </Box>
        </Stack>
      ) : wasRequestSuccessful === null ? (
        // Request is loading
        <Stack gap={2}>
          <Typography variant="h3">Sending your records</Typography>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "var(--upload-progress-bar)",
              },
            }}
          />
          <Typography>
            We’re processing your request, and sending the records to DATS. This
            should only take about 30 seconds. Please do not close the
            application or navigate away.
          </Typography>
          <Typography>
            Once the loading is complete, a success confirmation message will
            appear on this page.
          </Typography>
        </Stack>
      ) : (
        // Request was unsuccessful
        <Stack gap={2}>
          <Typography>An unexpected error occured.</Typography>
        </Stack>
      )}
    </>
  );
};
