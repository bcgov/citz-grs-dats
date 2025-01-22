import { useFolderList } from '@hooks/useFolderList';
import { Lightbulb as TipIcon } from '@mui/icons-material';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { useGridApiRef } from '@mui/x-data-grid';
import {
	ContinueButton,
	ContinueModal,
	FolderDisplayGrid,
	type FolderRow,
	SelectFolderButton,
} from '@renderer/components/file-list';
import { useCallback, useContext, useEffect, useState } from 'react';
import { TokenContext } from '../App';

type Props = {
	authenticated: boolean;
};

export const FolderListPage = ({ authenticated }: Props) => {
	const [continueButtonIsEnabled, setContinueButtonIsEnabled] =
		useState<boolean>(false);
	const [continueModalIsOpen, setContinueModalIsOpen] =
		useState<boolean>(false);

	const accessToken = useContext(TokenContext);

	const theme = useTheme();
	const apiRef = useGridApiRef();
	const folderList = useFolderList({ accessToken });

	const handleProgress = useCallback(
		(event: CustomEvent<{ source: string; progressPercentage: number }>) => {
			const { source, progressPercentage } = event.detail;
			folderList.setFolders((prevFolderList) =>
				prevFolderList.map((folder) =>
					folder.folder === source
						? { ...folder, progress: progressPercentage }
						: folder,
				),
			);
		},
		[folderList.setFolders],
	);

	const handleCompletion = useCallback(
		(
			event: CustomEvent<{
				source: string;
				success: boolean;
				metadata?: Record<string, unknown>;
				error?: unknown;
			}>,
		) => {
			const { source, success, metadata: newMetadata } = event.detail;

			if (success && newMetadata) {
				folderList.setMetaData((prev) => ({
					...prev,
					[source]: newMetadata[source],
				}));
				console.info(`Successfully processed folder: ${source}`);
			} else {
				console.error(`Failed to process folder: ${source}`);
			}
		},
		[folderList.setMetaData],
	);

	const handleRowUpdate = useCallback(
		(newFolder: FolderRow) => {
			folderList.setFolders((prevFolderList) =>
				prevFolderList.map((folder) =>
					folder.id === newFolder.id ? newFolder : folder,
				),
			);
			return newFolder;
		},
		[folderList.setFolders],
	);

	const handleOpenContinueModel = useCallback(() => {
		let isOpen = true;

		if (!continueButtonIsEnabled) isOpen = false;

		setContinueModalIsOpen(isOpen);
	}, [continueButtonIsEnabled]);

	const handleClose = useCallback(() => {
		setContinueModalIsOpen(false);
	}, []);

	const handleFormSubmit = useCallback(
		(formData) => {
			folderList.submit(formData);
		},
		[folderList.submit],
	);

	useEffect(() => {
		window.addEventListener(
			'folder-metadata-progress',
			handleProgress as EventListener,
		);

		window.addEventListener(
			'folder-metadata-completion',
			handleCompletion as EventListener,
		);

		return () => {
			window.removeEventListener(
				'folder-metadata-progress',
				handleProgress as EventListener,
			);
			window.removeEventListener(
				'folder-metadata-completion',
				handleCompletion as EventListener,
			);
		};
	}, [handleCompletion, handleProgress]);

	useEffect(() => {
		let isEnabled = true;

		if (folderList.folders.length <= 0) isEnabled = false;

		if (!authenticated) isEnabled = false;

		if (!folderList.folders.every((folder) => folder.progress === 100))
			isEnabled = false;

		setContinueButtonIsEnabled(isEnabled);
	}, [folderList.folders, authenticated]);

	return (
		<>
			<Stack
				direction='column'
				spacing={1}
				sx={{
					width: '100%',
					minHeight: '7vh',
					padding: 2,
					flexShrink: 0,
					background: `${theme.palette.primary}`,
				}}
			>
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
					<SelectFolderButton
						onRowChange={(inputPaths) =>
							folderList.addPathArrayToFolders(inputPaths, apiRef)
						}
					/>
					<ContinueButton
						onContinue={handleOpenContinueModel}
						isEnabled={continueButtonIsEnabled}
					/>
				</Box>
				<Stack
					direction='row'
					spacing={1}
				>
					<TipIcon sx={{ fontSize: '0.9em', color: 'var(--bcgov-yellow)' }} />
					<Typography sx={{ fontSize: '0.75em', color: 'var(--tip)' }}>
						<b>View/Edit Mode:</b> If a row is in 'View Mode' you can double
						click on any cell to put it in 'Edit Mode'.
					</Typography>
				</Stack>
			</Stack>
			<Box
				sx={{
					height: '90vh',
					paddingLeft: 2,
					paddingRight: 2,
					flexShrink: 0,
					background: `${theme.palette.primary}`,
				}}
			>
				<FolderDisplayGrid
					rows={folderList.folders}
					onFolderDelete={folderList.removeFolder}
					processRowUpdate={handleRowUpdate}
					apiRef={apiRef}
				/>
			</Box>
			{continueModalIsOpen && (
				<ContinueModal
					modalOpen={continueModalIsOpen}
					modalClose={handleClose}
					modalSubmit={handleFormSubmit}
				/>
			)}
		</>
	);
};
