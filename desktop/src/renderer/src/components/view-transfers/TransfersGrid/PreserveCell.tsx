import { IconButton, Tooltip } from "@mui/material";
import { DownloadDone as DoneIcon } from "@mui/icons-material";
import { PreserveIcon } from "@renderer/components/PreserveIcon";
import type {
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import type { Row } from "./TransfersGrid";

type Props = {
  params: GridRenderCellParams<Row, unknown, unknown, GridTreeNodeWithRender>;
  onTransferPreserve: (
    accession: string,
    application: string
  ) => Promise<void> | void;
  preserved: boolean;
  processed: boolean;
};

export const PreserveCell = ({
  params,
  onTransferPreserve,
  preserved,
  processed,
}: Props) => {
  return (
    <Tooltip
      title="Preserve transfer file to LibSafe."
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
        disabled={processed}
        disableFocusRipple
        disableRipple
        onClick={() =>
          onTransferPreserve(params.row.accession, params.row.application)
        }
        aria-label="preserve to libsafe"
      >
        {preserved ? (
          <DoneIcon
            sx={{ color: processed ? "var(--icon-disabled)" : "var(--icon)" }}
          />
        ) : (
          <PreserveIcon
            color={processed ? "var(--icon-disabled)" : "var(--icon)"}
          />
        )}
      </IconButton>
    </Tooltip>
  );
};
