import { Box, useTheme } from "@mui/material";
import {
	FolderDisplayGrid,
	type FolderRow,
	SelectFolderButton,
	ContinueButton,
	ContinueModal,
} from "@renderer/components/file-list";
import { useState } from "react";
import { useGridApiRef } from "@mui/x-data-grid";

export const FileListPage = () => {
	// setOpen state controls continue modal
	const [open, setOpen] = useState(false);
	// setRows state controls rows displayed
	const [rows, setRows] = useState<FolderRow[]>([]);
	const theme = useTheme();
	const apiRef = useGridApiRef();

	const onFolderDelete = (folder: string) => {
		alert(folder); // TBD
	};

	const handleOpen = () => {
		if (rows.length <= 0) {
			console.log("No rows selected");
			// TODO: add popup to suggest adding folder before cont
			setOpen(false);
		} else {
			setOpen(true);
		}
	};
	const handleClose = () => {
		setOpen(false);
	};

	const handleFormSubmit = (formData) => {
		// on form submit print the data we currently have and reset rows to empty list
		console.log("form submitted");
		console.log(formData);
		// TODO: process submitted form data
	};

	const handleAddPathArrayToRows = (inputPaths: string[]) => {
		const newRows: FolderRow[] = [...rows];
		let index = rows.length; // Start IDs based on the current rows
		const newRowIds: number[] = []; // Track IDs of the newly added rows

		try {
			for (let i = 0; i < inputPaths.length; i++) {
				const currentFolderPath = inputPaths[i];
				let skipFlag = false;

				// check if file path is already in the rows
				for (let j = 0; j < rows.length; j++) {
					if (currentFolderPath === rows[j].folder) skipFlag = true;
				}
				// if the path is already in the list, skip it
				if (skipFlag === true) continue;

				const curFolderRow: FolderRow = {
					id: index, // Unique IDs for new rows
					folder: currentFolderPath,
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
				// Track new row IDs
				newRowIds.push(index);
				index++;
				// add new folder row to list to be displayed
				newRows.push(curFolderRow);
			}
			// set the new list of folder rows
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
				<ContinueButton onContinue={handleOpen} />
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
			{open && (
				<ContinueModal
					modalOpen={handleOpen}
					modalClose={handleClose}
					modalSubmit={handleFormSubmit}
				/>
			)}
		</>
	);
};
