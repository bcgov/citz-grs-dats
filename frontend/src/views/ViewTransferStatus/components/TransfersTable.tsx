import React from "react";
import ITransferDTO from "../../../types/DTO/Interfaces/ITransferDTO";
import { Link } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

interface Column {
  id:
    | "applicationNumber"
    | "accessionNumber"
    | "description"
    | "ministry"
    | "branch"
    | "transferStatus";
  label: string;
  minWidth?: number;
}

const columns: readonly Column[] = [
  { id: "applicationNumber", label: "Application Number", minWidth: 75 },
  { id: "accessionNumber", label: "Accession Number", minWidth: 75 },
  { id: "description", label: "Description", minWidth: 200 },
  { id: "ministry", label: "Ministry", minWidth: 80 },
  { id: "branch", label: "Branch", minWidth: 100 },
  { id: "transferStatus", label: "Status", minWidth: 135 },
];

interface TransfersTableComponentProps {
  transfers: ITransferDTO[];
  loading: boolean;
}

const TransfersTable: React.FC<TransfersTableComponentProps> = ({
  transfers,
  loading,
}) => {
  console.log(transfers);
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 495 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow
                  key={transfer.applicationNumber + transfer.accessionNumber}
                >
                  <TableCell>{transfer.applicationNumber}</TableCell>
                  <TableCell>{transfer.accessionNumber}</TableCell>
                  <TableCell>{transfer.description}</TableCell>
                  <TableCell>{transfer.producerMinistry}</TableCell>
                  <TableCell>{transfer.producerBranch}</TableCell>
                  <TableCell>{transfer.transferStatus}</TableCell>
                  <TableCell>
                    <Link
                      className="btn btn-light"
                      to={`/edit-transfer/${transfer._id}`}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default TransfersTable;
