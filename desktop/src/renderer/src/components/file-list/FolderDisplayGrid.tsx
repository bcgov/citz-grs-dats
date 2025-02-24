import {
  DataGrid,
  type GridColDef,
  useGridApiContext,
  type GridRenderEditCellParams,
  type useGridApiRef,
  type GridCellParams,
  type MuiEvent,
} from "@mui/x-data-grid";
import { DeleteOutline as DeleteIcon } from "@mui/icons-material";
import {
  IconButton,
  Tooltip,
  InputBase,
  type InputBaseProps,
  Box,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import { styled } from "@mui/material/styles";
import { AnimatedProgress } from "./AnimatedProgress";

export type FolderRow = {
  id: number;
  folder: string;
  schedule: string;
  classification: string;
  file: string;
  opr: boolean;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  soDate: Dayjs | null;
  fdDate: Dayjs | null;
  progress: number;
};

const GridEditDateInput = styled(InputBase)({
  fontSize: "inherit",
  padding: "0 9px",
});

const WrappedGridEditDateInput = (props) => {
  const { InputProps, focused, ...other } = props;
  return (
    <GridEditDateInput
      fullWidth
      {...InputProps}
      {...(other as InputBaseProps)}
    />
  );
};

const GridEditDateCell = ({
  id,
  field,
  value,
}: GridRenderEditCellParams<FolderRow, Dayjs | null, string>) => {
  const apiRef = useGridApiContext();

  const handleChange = (newValue: Dayjs | null) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue });
  };

  return (
    <DatePicker
      value={value}
      onChange={handleChange}
      format="YYYY/MM/DD"
      slots={{ textField: WrappedGridEditDateInput }}
    />
  );
};

type Props = {
  rows: FolderRow[];
  onFolderDelete: (folder: string) => Promise<void> | void;
  processRowUpdate: (newRow: FolderRow) => FolderRow;
  apiRef: ReturnType<typeof useGridApiRef>;
};

export const FolderDisplayGrid = ({
  rows,
  onFolderDelete,
  processRowUpdate,
  apiRef,
}: Props) => {
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "progress",
      description: "Folder upload status.",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <AnimatedProgress progress={params.row.progress} />
      ),
    },
    {
      field: "folder",
      headerName: "Folder path",
      width: 200,
      description: "Network path to the folder.",
    },
    {
      field: "schedule",
      headerName: "Schedule",
      description: "Information Schedule number (e.g. 100001 for ARCS).",
      width: 110,
      editable: true,
    },
    {
      field: "classification",
      headerName: "Classification",
      description:
        "Classification number (e.g. 201-40 for Cabinet Submissions).",
      width: 150,
      editable: true,
    },
    {
      field: "file",
      headerName: "File ID",
      description:
        "File identifier to link multiple folders, if used (e.g. PEP for Provincial Emergency Program).",
      width: 90,
      editable: true,
    },
    {
      field: "opr",
      headerName: "OPR",
      type: "boolean",
      description:
        "Office of Primary Responsibility. Check the box if your office maintains the official copy of the records.",
      width: 60,
      editable: true,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      description: "Date the file was opened.",
      width: 145,
      editable: true,
      renderEditCell: (params) => <GridEditDateCell {...params} />,
      valueFormatter: (value) => {
        if (value) {
          return (value as Dayjs).format("YYYY/MM/DD");
        }
        return "";
      },
    },
    {
      field: "endDate",
      headerName: "End Date",
      description: "Date the file was closed.",
      width: 145,
      editable: true,
      renderEditCell: (params) => <GridEditDateCell {...params} />,
      valueFormatter: (value) => {
        if (value) {
          return (value as Dayjs).format("YYYY/MM/DD");
        }
        return "";
      },
    },
    {
      field: "soDate",
      headerName: "SO Date",
      description:
        "Date the file became Superseded or Obsolete (SO), if applicable.",
      width: 145,
      editable: true,
      renderEditCell: (params) => <GridEditDateCell {...params} />,
      valueFormatter: (value) => {
        if (value) {
          return (value as Dayjs).format("YYYY/MM/DD");
        }
        return "";
      },
    },
    {
      field: "fdDate",
      headerName: "FD Date",
      description: "Date the file was eligible for Final Disposition (FD).",
      width: 145,
      editable: true,
      renderEditCell: (params) => <GridEditDateCell {...params} />,
      valueFormatter: (value) => {
        if (value) {
          return (value as Dayjs).format("YYYY/MM/DD");
        }
        return "";
      },
    },
    {
      field: "delete",
      headerName: "Delete",
      description: "Remove folder from file list.",
      width: 100,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <Tooltip title="Delete folder.">
            <IconButton
              sx={{ color: "black" }}
              onClick={() => onFolderDelete(params.row.folder)}
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleCellKeyDown = (
    params: GridCellParams,
    event: MuiEvent<React.KeyboardEvent>
  ) => {
    if (event.key === "ArrowDown") {
      const { id, field, value, isEditable } = params;

      if (!value || !isEditable) return;

      const currentRowIndex = Number(id);

      // Iterate through all rows below the current one
      for (let i = currentRowIndex + 1; i < rows.length; i++) {
        const targetValue = apiRef.current.getCellValue(i, field);

        if (
          targetValue === undefined ||
          targetValue === null ||
          targetValue === ""
        ) {
          const isRowInEditMode = apiRef.current.getRowMode(i) === "edit";
          if (!isRowInEditMode) apiRef.current.startRowEditMode({ id: i });

          apiRef.current.setEditCellValue({ id: i, field, value });
        } else {
          break; // Stop when a non-empty row is found
        }
      }

      event.stopPropagation(); // Prevent default handling of the ArrowDown key
    }
  };

  const handleCellClick = (params: GridCellParams) => {
    if (!params.colDef.editable) return; // Ensure only editable fields trigger edit mode
    apiRef.current.startRowEditMode({ id: params.id });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          apiRef={apiRef}
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnMenu
          editMode="row"
          hideFooter
          processRowUpdate={processRowUpdate}
          onCellKeyDown={handleCellKeyDown}
          onCellClick={handleCellClick}
          sx={{
            "& .MuiDataGrid-cell:focus-within": {
              border: "3px solid #2E5DD7", // Cell focus
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};
