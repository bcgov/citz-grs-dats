import { IconButton, Tooltip } from "@mui/material";
import { DeleteOutline as DeleteIcon } from "@mui/icons-material";
import type {
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import type { Row } from "./TransfersGrid";

type Props = {
  params: GridRenderCellParams<Row, unknown, unknown, GridTreeNodeWithRender>;
  disable: boolean;
  onTransferDelete: (
    accession: string,
    application: string
  ) => Promise<void> | void;
};

export const DeleteCell = ({ params, disable, onTransferDelete }: Props) => {
  return (
    <Tooltip
      title="Delete transfer records in DATS."
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
        disabled={disable}
        onClick={() =>
          onTransferDelete(params.row.accession, params.row.application)
        }
        aria-label="delete"
      >
        <DeleteIcon
          sx={{ color: disable ? "var(--icon-disabled)" : "var(--icon)" }}
        />
      </IconButton>
    </Tooltip>
  );
};
