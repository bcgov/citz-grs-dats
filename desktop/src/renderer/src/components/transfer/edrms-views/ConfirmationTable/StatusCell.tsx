import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { Circle as ProgressIcon } from "@mui/icons-material";

type Props = {
  bufferProgress: number;
};

const getStatusDetails = ({ bufferProgress }: Props) => {
  const complete = bufferProgress === 100;
  const progress = Math.floor(bufferProgress);

  // Upload complete
  if (complete)
    return {
      tooltip: "Upload complete",
      iconColor: "var(--progress-complete)",
      progressMsg: `${progress}%`,
    };

  // Upload in progress
  return {
    tooltip: "Upload in progress.",
    iconColor: "var(--progress-incomplete)",
    progressMsg: progress > 0 ? `${progress}%` : "",
  };
};

export const StatusCell = ({ bufferProgress }: Props) => {
  const { tooltip, iconColor, progressMsg } = getStatusDetails({
    bufferProgress,
  });

  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Stack direction="row" gap={1}>
        <Tooltip title={tooltip}>
          <ProgressIcon
            sx={{
              color: iconColor,
            }}
          />
        </Tooltip>
        <Typography>{progressMsg}</Typography>
      </Stack>
    </Box>
  );
};
