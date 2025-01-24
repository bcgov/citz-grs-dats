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

export const StatusCell = ({ params }: Props) => {
  const complete =
    params.row.metadataProgress + params.row.bufferProgress === 200;
  const invalidPath = params.row.invalidPath;
  const progress = Math.floor(
    (params.row.metadataProgress + params.row.bufferProgress) / 2
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      {complete && !invalidPath ? (
        <Stack direction="row" gap={1}>
          <Tooltip title="Upload complete.">
            <ProgressIcon
              sx={{
                color: "var(--progress-complete)",
              }}
            />
          </Tooltip>
          <Typography>{`${progress}%`}</Typography>
        </Stack>
      ) : (
        <Stack direction="row" gap={1}>
          <Tooltip title="Upload in progress.">
            <ProgressIcon
              sx={{
                color: "var(--progress-incomplete)",
              }}
            />
          </Tooltip>
          <Typography>{progress > 0 ? `${progress}%` : ""}</Typography>
        </Stack>
      )}
      {invalidPath && (
        <Stack direction="row" gap={1}>
          <Tooltip title="Folder path could not be found. Use the edit button to change folder path.">
            <ProgressIcon
              sx={{
                color: "var(--progress-cancelled)",
              }}
            />
          </Tooltip>
        </Stack>
      )}
    </Box>
  );
};
