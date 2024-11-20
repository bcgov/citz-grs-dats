import { Box, useTheme } from "@mui/material";
import {
	FolderDisplayGrid,
	type FolderRow,
	SelectFolderButton,
	ContinueButton,
} from "@renderer/components/file-list";
import { useState } from "react";
import { useGridApiRef } from "@mui/x-data-grid";

export const FileListPage = () => {
	const [rows, setRows] = useState<FolderRow[]>([]);
	const theme = useTheme();
	const apiRef = useGridApiRef();

	const onFolderDelete = (folder: string) => {
		alert(folder); // TBD
	};

	const handleAddPathArrayToRows = (inputPaths: string[]) => {
		const newRows: FolderRow[] = [...rows];
		let index = rows.length; // Start IDs based on the current rows
		const newRowIds: number[] = []; // Track IDs of the newly added rows

		try {
			for (let i = 0; i < inputPaths.length; i++) {
				const curFolderRow: FolderRow = {
					id: index, // Unique IDs for new rows
					folder: inputPaths[i],
					schedule: "",
					classification: "",
					file: "",
					opr: false,
					startDate: null,
					endDate: null,
					soDate: null,
					fdDate: null,
					progress: 0,
				};
				newRowIds.push(index); // Track new row IDs
				index++;
				newRows.push(curFolderRow);
			}
			setRows(newRows);

			// Set all newly added rows to edit mode
			if (apiRef.current && newRowIds.length > 0) {
				setTimeout(() => {
					newRowIds.forEach((rowId) => {
						apiRef.current.startRowEditMode({ id: rowId });
					});
				});
			}
		} catch (error) {
			setRows(rows); // Revert rows on error
			console.log("Hit error:", error);
		}
	};

	return (
		<>
			<Box
				sx={{
					minHeight: "7vh",
					display: "flex",
					justifyContent: "flex-end",
					gap: 1,
					padding: 2,
					flexShrink: 0,
					background: `${theme.palette.primary}`,
				}}
			>
				<SelectFolderButton onRowChange={handleAddPathArrayToRows} />
				<ContinueButton />
			</Box>
			<Box
				sx={{
					height: "90vh",
					padding: 2,
					flexShrink: 0,
					background: `${theme.palette.primary}`,
				}}
			>
				<FolderDisplayGrid rows={rows} onFolderDelete={onFolderDelete} apiRef={apiRef} />
			</Box>
		</>
	);
};
