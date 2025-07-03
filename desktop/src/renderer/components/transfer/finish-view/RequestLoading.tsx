import { LinearProgress, Stack, Typography } from "@mui/material";

type Props = {
  loadingMessage: string | null;
};

export const RequestLoading = ({ loadingMessage }: Props) => {
  return (
    <Stack gap={3}>
      <Typography variant="h3">Sending your records</Typography>
      {loadingMessage && <Typography sx={{ color: '' }}>{loadingMessage}</Typography>}
      <LinearProgress
        sx={{
          "& .MuiLinearProgress-bar": {
            backgroundColor: "var(--upload-progress-bar)",
          },
        }}
      />
      <Typography>
        We’re processing your request, and sending the records to DATS. This may
        take some time, especially for large uploads. Please do not close the
        application or navigate away.
      </Typography>
      <Typography>
        Once the loading is complete, a success confirmation message will appear
        on this page.
      </Typography>
    </Stack>
  );
};
