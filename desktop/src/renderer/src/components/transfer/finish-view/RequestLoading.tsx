import { LinearProgress, Stack, Typography } from "@mui/material";

export const RequestLoading = () => {
  return (
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
