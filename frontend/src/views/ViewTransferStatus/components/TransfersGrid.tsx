import React from "react";
import ITransferDTO from "../../../types/DTO/Interfaces/ITransferDTO";
import { Link } from "react-router-dom";
import { Box, CircularProgress, Paper } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface TransferGridProps {
    transfers: ITransferDTO[];
    loading: boolean;
}

const TransferGrid: React.FC<TransferGridProps> = ({ transfers, loading }) => {
    const columns: GridColDef[] = [
        { field: "applicationNumber", headerName: "Application Number", minWidth: 75 },
        { field: "accessionNumber", headerName: "Accession Number", minWidth: 75 },
        { field: "description", headerName: "Description", minWidth: 200 },
        { field: "producerMinistry", headerName: "Ministry", minWidth: 120 },
        { field: "producerBranch", headerName: "Branch", minWidth: 120 },
        { field: "transferStatus", headerName: "Status", minWidth: 75 },
        {
            field: "action",
            headerName: "Action",
            renderCell: (params) => (
                <Link className="btn btn-light" to={`/edit-transfer/${params.row._id}`}>
                    View
                </Link>
            ),
            width: 100,
        },
    ];

    return (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <div style={{ height: 495, width: "100%" }}>
                    <DataGrid
                        rows={transfers}
                        columns={columns}
                        getRowId={(row) => row._id}
                        rowHeight={35}
                        autoHeight
                    />
                </div>
            )}
        </Paper>
    );
};

export default TransferGrid;
