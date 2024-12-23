import {
	DataGrid,
	type GridColDef,
	useGridApiContext,
	type GridRenderEditCellParams,
	type useGridApiRef,
	type GridCellParams,
	type MuiEvent,
} from "@mui/x-data-grid";
import {
	HighlightOff as DeleteIcon,
	CheckCircle as CheckIcon,
	Circle as LoadingIcon,
} from "@mui/icons-material";
import {
	IconButton,
	Stack,
	Tooltip,
	Typography,
	InputBase,
	type InputBaseProps,
	Box,
	useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import { styled } from "@mui/material/styles";

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
	return <GridEditDateInput fullWidth {...InputProps} {...(other as InputBaseProps)} />;
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

export const FolderDisplayGrid = ({ rows, onFolderDelete, processRowUpdate, apiRef }: Props) => {
	const theme = useTheme();

	const columns: GridColDef<(typeof rows)[number]>[] = [
		{
			field: "progress",
			headerName: "",
			width: 85,
			renderCell: (params) => (
				<Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
					<Stack direction="row" gap={1}>
						{params.row.progress === 100 ? (
							<CheckIcon color="success" />
						) : (
							<LoadingIcon style={{ color: `${theme.palette.warning.main}` }} />
						)}
						<Typography>{params.row.progress}%</Typography>
					</Stack>
				</Box>
			),
		},
		{ field: "folder", headerName: "Folder", width: 200, description: "Automatically populated." },
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
				"Office of Primary Responsibility (OPR) maintains the official copy of the records.",
			width: 60,
			editable: true,
		},
		{
			field: "startDate",
			headerName: "Start Date",
			description: "Date the file was opened.",
			width: 125,
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
			width: 125,
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
			width: 125,
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
			width: 125,
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
			headerName: "",
			width: 50,
			renderCell: (params) => (
				<Tooltip title="Delete folder.">
					<IconButton
						color="error"
						onClick={() => onFolderDelete(params.row.folder)}
						aria-label="delete"
					>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			),
		},
	];

	const handleCellKeyDown = (params: GridCellParams, event: MuiEvent<React.KeyboardEvent>) => {
		if (event.key === "ArrowDown") {
			const { id, field, value, isEditable } = params;

			if (!value || !isEditable) return;

			const currentRowIndex = Number(id);

			// Iterate through all rows below the current one
			for (let i = currentRowIndex + 1; i < rows.length; i++) {
				const targetValue = apiRef.current.getCellValue(i, field);

				if (targetValue === undefined || targetValue === null || targetValue === "") {
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
				/>
			</Box>
		</LocalizationProvider>
	);
};
