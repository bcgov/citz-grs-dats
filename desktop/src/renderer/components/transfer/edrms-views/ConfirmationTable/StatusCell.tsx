import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { Circle as ProgressIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";

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
      progress,
    };

  // Upload in progress
  return {
    tooltip: "Upload in progress.",
    iconColor: "var(--progress-incomplete)",
    progress,
  };
};

export const StatusCell = ({ bufferProgress }: Props) => {
  const { tooltip, iconColor, progress } = getStatusDetails({ bufferProgress });
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setShowText(false);
      }, 2000); // Hide text after 2 seconds
      () => clearTimeout(timer);
      return;
    }
    setShowText(true);
  }, [progress]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Stack direction="row" gap={1}>
        <Tooltip title={tooltip}>
          <ProgressIcon
            sx={{
              color: iconColor,
            }}
          />
        </Tooltip>
        {showText && progress !== null && <Typography>{progress}%</Typography>}
      </Stack>
    </Box>
  );
};
