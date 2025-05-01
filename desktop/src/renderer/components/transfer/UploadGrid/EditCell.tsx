import { IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import type {
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import type { Row } from "./FolderUploadGrid";

type Props = {
  params: GridRenderCellParams<Row, unknown, unknown, GridTreeNodeWithRender>;
  onFolderEdit: (folder: string) => Promise<void> | void;
};

export const EditCell = ({ params, onFolderEdit }: Props) => {
  const invalidPath = params.row.invalidPath;

  return (
    <Tooltip
      title={invalidPath ? "Folder path is invalid and must be edited." : ""}
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
        disabled={!invalidPath}
        onClick={() => onFolderEdit(params.row.folder)}
        aria-label="edit"
      >
        <EditIcon
          sx={{
            color: invalidPath ? "var(--icon)" : "var(--icon-disabled)",
          }}
        />
      </IconButton>
    </Tooltip>
  );
};
