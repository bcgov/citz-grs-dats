import { IconButton, Tooltip } from "@mui/material";
import { DeleteOutline as DeleteIcon } from "@mui/icons-material";
import type {
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import type { Row } from "./FolderUploadGrid";

type Props = {
  params: GridRenderCellParams<Row, unknown, unknown, GridTreeNodeWithRender>;
  onFolderDelete: (folder: string) => Promise<void> | void;
};

export const DeleteCell = ({ params, onFolderDelete }: Props) => {
  return (
    <Tooltip
      title="Delete folder from transfer."
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
        onClick={() => onFolderDelete(params.row.folder)}
        aria-label="delete"
      >
        <DeleteIcon sx={{ color: "var(--icon)" }} />
      </IconButton>
    </Tooltip>
  );
};
