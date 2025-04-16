import { Box, Tooltip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { DeleteCell } from "./DeleteCell";
import { DownloadCell } from "./DownloadCell";
import { PreserveCell } from "./PreserveCell";

export type Row = {
  id: number;
  accession: string;
  application: string;
  status: string;
  transferDate: string;
  processedBy?: string;
  processedOn?: string;
};

type Props = {
  rows: Row[];
  onTransferDelete: (
    accession: string,
    application: string
  ) => Promise<void> | void;
  onTransferDownload: (
    accession: string,
    application: string,
    previouslyDownloaded: boolean
  ) => Promise<void> | void;
  onTransferPreserve: (
    accession: string,
    application: string
  ) => Promise<void> | void;
};

export const formatDateToYMD = (dateString: string): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date string");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
};

export const TransfersGrid = ({
  rows,
  onTransferDelete,
  onTransferDownload,
  onTransferPreserve,
}: Props) => {
  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "accession",
      headerName: "Accession",
      flex: 1,
    },
    {
      field: "application",
      headerName: "Application",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        if (params.row.status === "Transfer deleted") {
          return (
            <Tooltip
              title={
                <div>
                  <p>
                    Date deleted:{" "}
                    {formatDateToYMD(
                      params.row.processedOn ?? new Date().toDateString()
                    )}
                  </p>
                  <p>Deleted by: {params.row.processedBy ?? "You"}</p>
                </div>
              }
            >
              <p>{params.row.status}</p>
            </Tooltip>
          );
        }
        return params.row.status;
      },
    },
    {
      field: "transferDate",
      headerName: "Date created",
      width: 120,
      sortComparator: (a, b) => {
        const dateA = new Date(a.replace(/\//g, "-")); // Convert YYYY/MM/DD to YYYY-MM-DD
        const dateB = new Date(b.replace(/\//g, "-"));
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      field: "preserve",
      headerName: "Preserve",
      description: "Preserve transfer file to LibSafe.",
      width: 100,
      renderCell: (params) => (
        <PreserveCell
          params={params}
          onTransferPreserve={onTransferPreserve}
          preserved={["Preserved", "Downloaded & Preserved"].includes(
            params.row.status
          )}
          processed={params.row.status === "Transfer deleted"}
        />
      ),
    },
    {
      field: "download",
      headerName: "Download",
      description: "Download transfer file.",
      width: 100,
      renderCell: (params) => (
        <DownloadCell
          params={params}
          onTransferDownload={onTransferDownload}
          previouslyDownloaded={[
            "Downloaded",
            "Downloaded & Preserved",
          ].includes(params.row.status)}
          processed={params.row.status === "Transfer deleted"}
        />
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      description: "Delete transfer records in DATS.",
      width: 100,
      renderCell: (params) => (
        <DeleteCell
          params={params}
          disable={
            !["Downloaded", "Downloaded & Preserved", "Preserved"].includes(
              params.row.status
            ) || params.row.status === "Transfer deleted"
          }
          onTransferDelete={onTransferDelete}
        />
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        disableColumnFilter
        disableColumnMenu
        hideFooter
      />
    </Box>
  );
};
