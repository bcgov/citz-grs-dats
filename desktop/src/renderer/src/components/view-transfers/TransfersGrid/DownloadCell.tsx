import { IconButton, Tooltip } from "@mui/material";
import { DownloadDone as DoneIcon } from "@mui/icons-material";
import { DownloadIcon } from "@renderer/components/DownloadIcon";
import type {
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import type { Row } from "./TransfersGrid";

type Props = {
  params: GridRenderCellParams<Row, unknown, unknown, GridTreeNodeWithRender>;
  onTransferDownload: (
    accession: string,
    application: string,
    previouslyDownloaded: boolean
  ) => Promise<void> | void;
  previouslyDownloaded: boolean;
};

export const DownloadCell = ({
  params,
  onTransferDownload,
  previouslyDownloaded,
}: Props) => {
  return (
    <Tooltip
      title="Download transfer file."
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <IconButton
        color="error"
        disableFocusRipple
        disableRipple
        onClick={() =>
          onTransferDownload(
            params.row.accession,
            params.row.application,
            previouslyDownloaded
          )
        }
        aria-label="delete"
      >
        {previouslyDownloaded ? (
          <DoneIcon sx={{ color: "var(--icon)" }} />
        ) : (
          <DownloadIcon />
        )}
      </IconButton>
    </Tooltip>
  );
};
