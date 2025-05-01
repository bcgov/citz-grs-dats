import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { Circle as ProgressIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import type {
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import type { Row } from "./FolderUploadGrid";

type Props = {
  params: GridRenderCellParams<Row, unknown, unknown, GridTreeNodeWithRender>;
};

const getStatusDetails = ({ params }: Props) => {
  const invalidPath = params.row.invalidPath;
  const progress = Math.floor(
    (params.row.metadataProgress + params.row.bufferProgress) / 2
  );

  // Upload complete
  if (progress === 100 && !invalidPath)
    return {
      tooltip: "Upload complete",
      iconColor: "var(--progress-complete)",
      progress,
    };

  // Upload in progress
  if (progress !== 100 && !invalidPath)
    return {
      tooltip: "Upload in progress.",
      iconColor: "var(--progress-incomplete)",
      progress,
    };

  // Invalid path
  return {
    tooltip:
      "Folder path not found or folder is empty. Use the edit button to update or the delete button to remove.",
    iconColor: "var(--progress-cancelled)",
    progress: null,
  };
};

export const StatusCell = ({ params }: Props) => {
  const { tooltip, iconColor, progress } = getStatusDetails({ params });
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
