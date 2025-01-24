import { Box, IconButton, Tooltip } from "@mui/material";
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
  return (
    <>
      {params.row.invalidPath ? (
        <Tooltip
          title="Folder path is invalid and must be edited."
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
            onClick={() => onFolderEdit(params.row.folder)}
            aria-label="edit"
          >
            <EditIcon
              sx={{
                color: "var(--icon)",
              }}
            />
          </IconButton>
        </Tooltip>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <IconButton color="error" disabled={true} aria-label="edit">
            <EditIcon
              sx={{
                color: "var(--icon-disabled)",
              }}
            />
          </IconButton>
        </Box>
      )}
    </>
  );
};
