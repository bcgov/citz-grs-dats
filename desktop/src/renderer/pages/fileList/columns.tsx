import type { GridColDef } from "@mui/x-data-grid";
import { GridEditDateCell } from "@renderer/components";
import type { FolderRow } from "@/renderer/types";
import type { Dayjs } from "dayjs";

export const columns: GridColDef<FolderRow>[] = [
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
		description: "Classification number (e.g. 201-40 for Cabinet Submissions).",
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
		description: "Date the file became Superseded or Obsolete (SO), if applicable.",
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
];
