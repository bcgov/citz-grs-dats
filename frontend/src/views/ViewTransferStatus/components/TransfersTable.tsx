import React, { useEffect, useState } from "react";
import ITransferDTO from "../../../types/DTO/Interfaces/ITransferDTO";
import { TransferService } from "../../../services/transferService";
import { Link } from "react-router-dom"; // Import Link component
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

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
  {
    id: "description",
    label: "Description",
    minWidth: 200,
  },
  {
    id: "ministry",
    label: "Ministry",
    minWidth: 120,
  },
  {
    id: "branch",
    label: "Branch",
    minWidth: 120,
  },
  {
    id: "transferStatus",
    label: "Status",
    minWidth: 75,
  },
];

export default function TransfersTable() {
  const [transfers, setTransfers] = useState<ITransferDTO[]>([]);
  const transferService = new TransferService();

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const transfers = await transferService.getTransfers();
        setTransfers(transfers);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchTransfers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
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
                <TableCell>{transfer.status}</TableCell>
                <TableCell>
                  <Link
                    className="btn btn-light"
                    to={`/TransferViewEdit/${transfer._id}`}
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
