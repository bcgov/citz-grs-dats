import { Box, useTheme } from "@mui/material";
import {
	FolderDisplayGrid,
	type FolderRow,
	SelectFolderButton,
	ContinueButton,
} from "@renderer/components/file-list";
import { useEffect, useState } from "react";
import { useGridApiRef } from "@mui/x-data-grid";

export const FileListPage = () => {
	const [workers] = useState(window.api.workers);
	const [rows, setRows] = useState<FolderRow[]>([]);
	const [metadata, setMetadata] = useState<Record<string, unknown>>({});
	const [pendingPaths, setPendingPaths] = useState<string[]>([]); // Tracks paths needing metadata processing
	const theme = useTheme();
	const apiRef = useGridApiRef();

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

	const onFolderDelete = (folder: string) => {
		setRows((prevRows) => prevRows.filter((row) => row.folder !== folder));
		setMetadata((prevMetadata) => {
			const { [folder]: _, ...remainingMetadata } = prevMetadata; // Remove the deleted folder
			return remainingMetadata;
		});
		console.log(`Deleted folder: ${folder}`);
	};

	const handleAddPathArrayToRows = (inputPaths: string[]) => {
		const newRows: FolderRow[] = [...rows];
		let index = rows.length; // Start IDs based on the current rows
		const pathsToProcess: string[] = [];

		try {
			for (const filePath of inputPaths) {
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
		} catch (error) {
			setRows(rows); // Revert rows on error
			console.error("Error adding rows:", error);
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
