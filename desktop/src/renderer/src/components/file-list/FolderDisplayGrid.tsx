import { useFolderList } from "@/hooks";
import { DeleteOutline as DeleteIcon } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
	DataGrid,
	type GridCellParams,
	type GridColDef,
	type MuiEvent,
} from "@mui/x-data-grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
	AccessionApplicationChecker,
	AnimatedProgress,
	ContinueButton,
} from "@renderer/components";
import type { FolderRow } from "@renderer/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SelectFolderButton } from "./SelectFolderButton";

export type FolderDisplayGridProps = {
	// apiRef: ReturnType<typeof useGridApiRef>;
	columns: GridColDef<FolderRow>[];
	// onFolderDelete: (folder: string) => Promise<void> | void;
	// processRowUpdate: (newRow: FolderRow) => FolderRow;
	// rows: FolderRow[];
};

export const FolderDisplayGrid = (props: FolderDisplayGridProps) => {
	const {
		// apiRef,
		columns: columnProps,
		// onFolderDelete,
		// processRowUpdate,
		// rows,
	} = props;

	const [hasAccessionApplication, setHasAccessionApplication] = useState<
		boolean | null
	>(null);
	const [continueButtonIsEnabled, setContinueButtonIsEnabled] =
		useState<boolean>(false);

	const { addPathArrayToFolders, apiRef, folders, removeFolder, setFolders } =
		useFolderList();

	const columns = useMemo(() => {
		return [
			{
				field: "progress",
				description: "Folder upload status.",
				headerName: "Status",
				width: 100,
				renderCell: (params) => (
					<AnimatedProgress progress={params.row.progress} />
				),
			},
			...columnProps,
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
								onClick={() => removeFolder(params.row.folder)}
								aria-label="delete"
							>
								<DeleteIcon />
							</IconButton>
						</Tooltip>
					</Box>
				),
			},
		] as GridColDef<FolderRow>[];
	}, [columnProps]);

	const handleCellKeyDown = (
		params: GridCellParams,
		event: MuiEvent<React.KeyboardEvent>,
	) => {
		if (event.key === "ArrowDown") {
			const { id, field, value, isEditable } = params;

			if (!value || !isEditable) return;

			const currentFolderIndex = Number(id);

			// Iterate through all rows below the current one
			for (let i = currentFolderIndex + 1; i < folders.length; i++) {
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

	const handleRowUpdate = useCallback(
		(newFolder: FolderRow) => {
			setFolders((prevFolderList) =>
				prevFolderList.map((folder) =>
					folder.id === newFolder.id ? newFolder : folder,
				),
			);
			return newFolder;
		},
		[setFolders],
	);

	const handleOpenContinueModel = useCallback(() => {
		let isOpen = true;

		if (!continueButtonIsEnabled) isOpen = false;

		setFinalizeModalIsOpen(isOpen);
	}, [continueButtonIsEnabled]);

	useEffect(() => {
		if (folders.length === 0) {
			setHasAccessionApplication(null);
		} else {
			
		}
	}, [folders]);

	return (
		<>
			<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
				<SelectFolderButton
					onRowChange={(inputPaths) => addPathArrayToFolders(inputPaths)}
				/>
			</Box>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<Box sx={{ width: "100%" }}>
					<DataGrid
						rows={folders}
						columns={columns}
						apiRef={apiRef}
						disableRowSelectionOnClick
						disableColumnFilter
						disableColumnMenu
						editMode="row"
						hideFooter
						processRowUpdate={handleRowUpdate}
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
			<AccessionApplicationChecker
				hasAccessionApplication={hasAccessionApplication}
				setAccessionApplication={setHasAccessionApplication}
				enabled={folders.length > 0}
			/>
			<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
				<ContinueButton
					onContinue={handleOpenContinueModel}
					isEnabled={continueButtonIsEnabled}
				/>
			</Box>
		</>
	);
};
