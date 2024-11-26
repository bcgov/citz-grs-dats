import { Box, Stack, Typography, useTheme } from "@mui/material";
import {
	FolderDisplayGrid,
	type FolderRow,
	SelectFolderButton,
	ContinueButton,
	ContinueModal,
} from "@renderer/components/file-list";
import { useEffect, useState } from "react";
import { useGridApiRef } from "@mui/x-data-grid";
import { Lightbulb as TipIcon } from "@mui/icons-material";

export const FileListPage = () => {
	// setOpen state controls continue modal
	const [open, setOpen] = useState(false);
	// setRows state controls rows displayed
	const [workers] = useState(window.api.workers);
	const [rows, setRows] = useState<FolderRow[]>([]);
  const [workers] = useState(window.api.workers);
	const [metadata, setMetadata] = useState<Record<string, unknown>>({});
	const [pendingPaths, setPendingPaths] = useState<string[]>([]); // Tracks paths needing metadata processing
	const theme = useTheme();
	const apiRef = useGridApiRef();

	useEffect(() => {
		console.log(metadata); // TEMP
	}, [metadata]);

	useEffect(() => {
		const handleProgress = (event: CustomEvent<{ source: string; progressPercentage: number }>) => {
			const { source, progressPercentage } = event.detail;
			setRows((prevRows) =>
				prevRows.map((row) =>
					row.folder === source ? { ...row, progress: progressPercentage } : row,
				),
			);
		};

		const handleCompletion = (
			event: CustomEvent<{
				source: string;
				success: boolean;
				metadata?: Record<string, unknown>;
				error?: unknown;
			}>,
		) => {
			const { source, success, metadata: newMetadata } = event.detail;

			if (success && newMetadata) {
				setMetadata((prev) => ({
					...prev,
					[source]: newMetadata[source],
				}));
				console.log(`Successfully processed folder: ${source}`);
			} else {
				console.error(`Failed to process folder: ${source}`);
			}
		};

		window.addEventListener("folder-metadata-progress", handleProgress as EventListener);
		window.addEventListener("folder-metadata-completion", handleCompletion as EventListener);

		return () => {
			window.removeEventListener("folder-metadata-progress", handleProgress as EventListener);
			window.removeEventListener("folder-metadata-completion", handleCompletion as EventListener);
		};
	}, []);

	useEffect(() => {
		// Process pending paths for metadata
		if (pendingPaths.length > 0) {
			const pathsToProcess = [...pendingPaths];
			setPendingPaths([]); // Clear pending paths to avoid duplicates

			pathsToProcess.forEach((filePath) => {
				getFolderMetadata(filePath).catch((error) =>
					console.error(`Failed to fetch metadata for folder ${filePath}:`, error),
				);
			});
		}
	}, [pendingPaths]);

	const getFolderMetadata = async (filePath: string) => {
		try {
			await workers.getFolderMetadata({
				filePath,
			});
		} catch (error) {
			console.error(`Failed to fetch metadata for folder ${filePath}:`, error);
		}
	};

	const processRowUpdate = (newRow: FolderRow) => {
		// Update the row in the state
		setRows((prevRows) => prevRows.map((row) => (row.id === newRow.id ? newRow : row)));
		return newRow;
	};

	const onFolderDelete = (folder: string) => {
		setRows((prevRows) => prevRows.filter((row) => row.folder !== folder));
		setMetadata((prevMetadata) => {
			const { [folder]: _, ...remainingMetadata } = prevMetadata; // Remove the deleted folder
			return remainingMetadata;
		});
		console.log(`Deleted folder: ${folder}`);
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
		const pathsToProcess: string[] = [];

		try {
			for (const filePath of inputPaths) {
				// Check if filePath is already in the rows
				const isAlreadyInRows = rows.some((row) => row.folder === filePath);

				if (isAlreadyInRows) continue; // Skip if filePath is already in rows

				const curFolderRow: FolderRow = {
					id: index, // Unique IDs for new rows
					folder: filePath,
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

				newRows.push(curFolderRow);
				pathsToProcess.push(filePath); // Add path to pending processing
				index++;
			}

			setRows(newRows); // Update rows first
			setPendingPaths((prev) => [...prev, ...pathsToProcess]); // Add paths to pendingPaths

			// Set all newly added rows to edit mode
			if (apiRef.current && newRows.length > 0) {
				setTimeout(() => {
					newRows.forEach(({ id }) => {
						const isRowInEditMode = apiRef.current.getRowMode(id) === "edit";
						if (!isRowInEditMode) {
							apiRef.current.startRowEditMode({ id });
						}
					});
				});
			}
		} catch (error) {
			setRows(rows); // Revert rows on error
			console.error("Error adding rows:", error);
		}
	};

	return (
		<>
			<Stack
				direction="column"
				spacing={1}
				sx={{
					width: "100%",
					minHeight: "7vh",
					padding: 2,
					flexShrink: 0,
					background: `${theme.palette.primary}`,
				}}
			>
				<SelectFolderButton onRowChange={handleAddPathArrayToRows} />
				<ContinueButton onContinue={handleOpen} />
			</Box>
				<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
					<SelectFolderButton onRowChange={handleAddPathArrayToRows} />
					<ContinueButton />
				</Box>
				<Stack direction="row" spacing={1}>
					<TipIcon sx={{ fontSize: "0.9em", color: "var(--bcgov-yellow)" }} />
					<Typography sx={{ fontSize: "0.75em", color: "var(--tip)" }}>
						<b>View/Edit Mode:</b> If a row is in 'View Mode' you can double click on any cell to
						put it in 'Edit Mode'.
					</Typography>
				</Stack>
			</Stack>
			<Box
				sx={{
					height: "90vh",
					paddingLeft: 2,
					paddingRight: 2,
					flexShrink: 0,
					background: `${theme.palette.primary}`,
				}}
			>
				<FolderDisplayGrid
					rows={rows}
					onFolderDelete={onFolderDelete}
					processRowUpdate={processRowUpdate}
					apiRef={apiRef}
				/>
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
