import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";

function randomId() {
  var retval = Math.floor(Math.random() * 100000);
  console.log("randomInteger generated " + retval);
  return retval;
}

interface DigitalfileListGridProps {
  initialRows: GridRowsProp;
  onSaveClick: (id: GridRowId) => void;
  onDeleteClick: (id: GridRowId) => void;
  onProcessRowUpdate: (newRow: GridRowModel) => void;
}

const EditToolbar: React.FC<{
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
}> = (props) => {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        _id: "",
        id,
        folder: "test",
        schedule: "",
        primarySecondary: "",
        fileId: "",
        isNew: true,
        opr: false,
        startDate: "",
        endDate: "",
        SODate: "",
        FDDate: "",
        transfer: "",
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add a new folder
      </Button>
    </GridToolbarContainer>
  );
};

const DigitalfileListGrid: React.FC<DigitalfileListGridProps> = (props) => {
  const { initialRows, onSaveClick, onDeleteClick, onProcessRowUpdate } = props;
  const [rows, setRows] = useState(initialRows);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    // const savedRow = rows.find((row) => row.id === id);
    onSaveClick(id);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    onDeleteClick(id);
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow };
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    console.log(updatedRow.isNew);
    onProcessRowUpdate(updatedRow);
    updatedRow.isNew = false;
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    { field: "folder", headerName: "folder", width: 250, editable: true },
    {
      field: "schedule",
      headerName: "schedule",
      width: 85,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "primarySecondary",
      headerName: "Primary/Secondary",
      width: 150,
      editable: true,
    },
    {
      field: "fileId",
      headerName: "FILE ID",
      width: 65,
      editable: true,
    },
    {
      field: "opr",
      headerName: "OPR",
      type: "boolean",
      width: 25,
      editable: true,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      type: "date",
      width: 100,
      editable: true,
      valueGetter: (params) =>
        params.row.startDate ? new Date(params.row.startDate) : null,
    },
    {
      field: "endDate",
      headerName: "End Date",
      type: "date",
      width: 100,
      editable: true,
      valueGetter: (params) =>
        params.row.endDate ? new Date(params.row.endDate) : null,
    },
    {
      field: "SODate",
      headerName: "SO Date",
      type: "date",
      width: 100,
      editable: true,
      valueGetter: (params) =>
        params.row.SODate ? new Date(params.row.SODate) : null,
    },
    {
      field: "FDDate",
      headerName: "FD Date",
      type: "date",
      width: 100,
      editable: true,
      valueGetter: (params) =>
        params.row.FDDate ? new Date(params.row.FDDate) : null,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 500,
        width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
      />
    </Box>
  );
};

export default DigitalfileListGrid;
