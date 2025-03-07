import { IconButton, Tooltip } from "@mui/material";
import { DeleteOutline as DeleteIcon } from "@mui/icons-material";
import type {
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import type { Row } from "./TransfersGrid";

type Props = {
  params: GridRenderCellParams<Row, unknown, unknown, GridTreeNodeWithRender>;
  onTransferDelete: (
    accession: string,
    application: string
  ) => Promise<void> | void;
};

export const DeleteCell = ({ params, onTransferDelete }: Props) => {
  return (
    <Tooltip
      title="Delete transfer."
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
        onClick={() =>
          onTransferDelete(params.row.accession, params.row.application)
        }
        aria-label="delete"
      >
        <DeleteIcon sx={{ color: "var(--icon)" }} />
      </IconButton>
    </Tooltip>
  );
};
