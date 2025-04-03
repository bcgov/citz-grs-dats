import { useAuth, useFolderList, useNavigate } from "@/hooks";
import { Box, Stack, Typography } from "@mui/material";
import { Instruction, Toast } from "@renderer/components";
import {
	AccessionApplicationChecker,
	ContinueButton,
	FinalizeFilelistModal,
	FolderDisplayGrid,
	ReturnToHomeModal,
} from "@renderer/components/file-list";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { columns } from "./columns";

export const FileListActionsPage = () => {
	const columnsMemo = useMemo(() => columns || [], [columns]);


	const [accAppCheckIsEnabled, setAccAppCheckIsEnabled] =
		useState<boolean>(false);
	const [finalizeModalIsOpen, setFinalizeModalIsOpen] =
		useState<boolean>(false);
	const [returnHomeModalIsOpen, setReturnHomeModalIsOpen] =
		useState<boolean>(false);
	// const [hasAccessionApplication, setHasAccessionApplication] = useState<
	// 	boolean | null
	// >(null);

	const { navigate } = useNavigate();

	const { accessToken } = useAuth();

	const authenticated = !!accessToken;

	const { folders, submit } = useFolderList();



	const handleFinalizeModalClose = useCallback(() => {
		setFinalizeModalIsOpen(false);
	}, []);

	const handleReturnHomeModalClose = useCallback(() => {
		setReturnHomeModalIsOpen(false);
	}, []);

	const handleFormSubmit = useCallback(
		async (formData) => {
			try {
				await submit(formData);
				setFinalizeModalIsOpen(false);
				setReturnHomeModalIsOpen(true);
			} catch (error) {
				console.error(error);
				setFinalizeModalIsOpen(false);
				toast.error(Toast, {
					data: {
						success: false,
						title: "Submission failed",
						message:
							"We were unable to fulfill your request to create a file list. Please try again.",
					},
				});
			}
		},
		[submit],
	);

	useEffect(() => {
		const allFoldersProcessed = folders.every(
			(folder) => folder.progress === 100,
		);
		const hasFolders = folders.length > 0;

		// setAccAppCheckIsEnabled(hasFolders);
		// if (!hasFolders) setHasAccessionApplication(null);

		// Enable continue button when folders are processed.
		setContinueButtonIsEnabled(
			allFoldersProcessed && hasFolders && authenticated,
		);
	}, [folders, authenticated]);

	useEffect(() => {
		console.log("folders", folders);
	}, [folders]);

	return (
		<Stack gap={2}>
			<Typography variant="h2">Create file list</Typography>

			<Stack gap={2}>
				<Typography variant="h4">Instructions</Typography>
				<Instruction
					num={1}
					instruction="Click the “Add folder(s)” button to start adding folders to your file list"
					required={true}
					desc="Tip: Upload multiple folders at once by selecting several folders in the file explorer window, or by clicking “upload folder(s)” again while a previously added folder is in progress."
				/>
				<Instruction
					num={2}
					instruction="Provide additional information about your folder(s) in the columns provided or, if preferred, do it later in Excel"
					required={false}
				/>
				<Instruction
					num={3}
					instruction="Remove any unwanted folders by clicking the delete icon"
					required={false}
				/>
			</Stack>

			<FolderDisplayGrid columns={columnsMemo} />

			<FinalizeFilelistModal
				open={finalizeModalIsOpen}
				onClose={handleFinalizeModalClose}
				onSubmit={handleFormSubmit}
				hasAccessionApplication={false}
			/>
			<ReturnToHomeModal
				open={returnHomeModalIsOpen}
				onClose={handleReturnHomeModalClose}
				setCurrentPath={(path) => navigate(path)}
			/>
		</Stack>
	);
};
