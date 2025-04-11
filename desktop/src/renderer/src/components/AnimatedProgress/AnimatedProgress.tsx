import { Box, Stack, Typography, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import {
  CheckCircle as CheckIcon,
  Circle as LoadingIcon,
} from "@mui/icons-material";

export const AnimatedProgress = ({ progress }: { progress: number }) => {
  const theme = useTheme();
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setShowText(false);
      }, 2000); // Wait 2 seconds before hiding text
      () => clearTimeout(timer);
      return;
    }
    setShowText(true); // Reset when progress is not 100
  }, [progress]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <Stack
        direction="row"
        gap={1}
        sx={{ width: "100%", justifyContent: "center" }}
      >
        {progress === 100 ? (
          <CheckIcon color="success" />
        ) : (
          <LoadingIcon style={{ color: `${theme.palette.warning.main}` }} />
        )}
        {showText && <Typography>{progress}%</Typography>}
      </Stack>
    </Box>
  );
};
