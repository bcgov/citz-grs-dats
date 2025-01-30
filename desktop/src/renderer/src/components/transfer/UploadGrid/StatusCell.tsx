import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { Circle as ProgressIcon } from "@mui/icons-material";
import type {
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import type { Row } from "./FolderUploadGrid";

type Props = {
  params: GridRenderCellParams<Row, unknown, unknown, GridTreeNodeWithRender>;
};

const getStatusDetails = ({ params }: Props) => {
  const complete =
    params.row.metadataProgress + params.row.bufferProgress === 200;
  const invalidPath = params.row.invalidPath;
  const progress = Math.floor(
    (params.row.metadataProgress + params.row.bufferProgress) / 2
  );

  // Upload complete
  if (complete && !invalidPath)
    return {
      tooltip: "Upload complete",
      iconColor: "var(--progress-complete)",
      progressMsg: `${progress}%`,
    };

  // Upload in progress
  if (!complete && !invalidPath)
    return {
      tooltip: "Upload in progress.",
      iconColor: "var(--progress-incomplete)",
      progressMsg: progress > 0 ? `${progress}%` : "",
    };

  // Invalid path
  return {
    tooltip:
      "Folder path not found or folder is empty. Use the edit button to update or the delete button to remove.",
    iconColor: "var(--progress-cancelled)",
    progressMsg: "",
  };
};

export const StatusCell = ({ params }: Props) => {
  const { tooltip, iconColor, progressMsg } = getStatusDetails({ params });

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
