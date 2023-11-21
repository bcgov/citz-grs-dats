import React, { useEffect, useState } from "react";
import { ITransfer } from "dats_shared/Types/interfaces/ITransfer";
import { TransferService } from "../../../services/transferService"; // Adjust the path
// import CreateTransferModal from "./TransferCreateModal";
// import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import ITransferFormData from "../../../types/Interfaces/ITransferFormData";
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
    | "status";
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
    id: "status",
    label: "Status",
    minWidth: 75,
  },
];

export default function TransfersTable() {
  //   const [page, setPage] = React.useState(0);
  //   const [rowsPerPage, setRowsPerPage] = React.useState(10);

  //   const handleChangePage = (event: unknown, newPage: number) => {
  //     setPage(newPage);
  //   };

  //   const handleChangeRowsPerPage = (
  //     event: React.ChangeEvent<HTMLInputElement>
  //   ) => {
  //     setRowsPerPage(+event.target.value);
  //     setPage(0);
  //   };

  const [transfers, setTransfers] = useState<ITransfer[]>([]);
  const transferService = new TransferService();

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const transfers = await transferService.getTransfers();
        console.log(transfers);
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
              <TableRow key={transfer.id}>
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
      {/* <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      /> */}
    </Paper>
  );
}
