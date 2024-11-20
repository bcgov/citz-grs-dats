import {
	DataGrid,
	type GridColDef,
	useGridApiContext,
	type GridRenderEditCellParams,
	type useGridApiRef,
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
			slots={{ textField: WrappedGridEditDateInput }}
		/>
	);
};

type Props = {
	rows: FolderRow[];
	onFolderDelete: (folder: string) => Promise<void> | void;
	apiRef: ReturnType<typeof useGridApiRef>;
};

export const FolderDisplayGrid = ({ rows, onFolderDelete, apiRef }: Props) => {
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
		{ field: "folder", headerName: "Folder", width: 200 },
		{ field: "schedule", headerName: "Schedule", width: 110, editable: true },
		{ field: "classification", headerName: "Primary/Secondary", width: 150, editable: true },
		{ field: "file", headerName: "FILE ID", width: 90, editable: true },
		{
			field: "opr",
			headerName: "OPR",
			type: "boolean",
			description: "Office of Primary Responsibility",
			width: 60,
			editable: true,
		},
		{
			field: "startDate",
			headerName: "Start Date",
			width: 125,
			editable: true,
			renderEditCell: (params) => <GridEditDateCell {...params} />,
			valueFormatter: (value) => {
				if (value) {
					return (value as Dayjs).format("MM/DD/YYYY");
				}
				return "";
			},
		},
		{
			field: "endDate",
			headerName: "End Date",
			width: 125,
			editable: true,
			renderEditCell: (params) => <GridEditDateCell {...params} />,
			valueFormatter: (value) => {
				if (value) {
					return (value as Dayjs).format("MM/DD/YYYY");
				}
				return "";
			},
		},
		{
			field: "soDate",
			headerName: "SO Date",
			width: 125,
			editable: true,
			renderEditCell: (params) => <GridEditDateCell {...params} />,
			valueFormatter: (value) => {
				if (value) {
					return (value as Dayjs).format("MM/DD/YYYY");
				}
				return "";
			},
		},
		{
			field: "fdDate",
			headerName: "FD Date",
			width: 125,
			editable: true,
			renderEditCell: (params) => <GridEditDateCell {...params} />,
			valueFormatter: (value) => {
				if (value) {
					return (value as Dayjs).format("MM/DD/YYYY");
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
				/>
			</Box>
		</LocalizationProvider>
	);
};
