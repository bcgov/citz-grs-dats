import { Box } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type useGridApiRef,
} from "@mui/x-data-grid";
import { EditCell } from "./EditCell";
import { DeleteCell } from "./DeleteCell";
import { StatusCell } from "./StatusCell";

export type Row = {
  id: number;
  folder: string;
  invalidPath: boolean;
  bufferProgress: number;
  metadataProgress: number;
};

type Props = {
  rows: Row[];
  onFolderDelete: (folder: string) => Promise<void> | void;
  onFolderEdit: (folder: string) => Promise<void> | void;
  processRowUpdate: (newRow: Row) => Row;
  apiRef: ReturnType<typeof useGridApiRef>;
};

export const FolderUploadGrid = ({
  rows,
  onFolderDelete,
  onFolderEdit,
  processRowUpdate,
  apiRef,
}: Props) => {
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "progress",
      headerName: "Status",
      description: "Progress of the folder upload.",
      width: 95,
      renderCell: (params) => <StatusCell params={params} />,
    },
    {
      field: "folder",
      headerName: "Folder path",
      flex: 1,
      description: "Network path to the folder.",
    },
    {
      field: "edit",
      headerName: "Edit",
      description: "Used to modify folder path when the path is invalid.",
      width: 70,
      renderCell: (params) => (
        <EditCell params={params} onFolderEdit={onFolderEdit} />
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      description: "Used to remove the folder from your transfer.",
      width: 70,
      renderCell: (params) => (
        <DeleteCell params={params} onFolderDelete={onFolderDelete} />
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        apiRef={apiRef}
        disableRowSelectionOnClick
        disableColumnFilter
        disableColumnSorting
        disableColumnMenu
        editMode="row"
        hideFooter
        processRowUpdate={processRowUpdate}
      />
    </Box>
  );
};
