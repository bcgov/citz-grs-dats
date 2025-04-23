import { useFolderList, useNavigate } from "@/hooks";
import { Stack, Typography } from "@mui/material";
import { Instruction, Toast } from "@renderer/components";
import {
	FinalizeFilelistModal,
	FolderDisplayGrid,
	ReturnToHomeModal,
} from "@renderer/components/file-list";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { columns } from "./columns";

export const FileListActionsPage = () => {
		const [hasAccessionApplication, setHasAccessionApplication] = useState<
			boolean | null
		>(null);
	const columnsMemo = useMemo(() => columns || [], [columns]);

	const [finalizeModalIsOpen, setFinalizeModalIsOpen] =
		useState<boolean>(false);
	const [returnHomeModalIsOpen, setReturnHomeModalIsOpen] =
		useState<boolean>(false);

	const { navigate } = useNavigate();

	const { submit } = useFolderList();

	const handleFinalizeModalClose = () => setFinalizeModalIsOpen(false);

	const handleReturnHomeModalClose = () => setReturnHomeModalIsOpen(false);

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

	return (
		<Stack gap={2}>
			<Typography variant="h2">Create file list</Typography>
			<Stack gap={2}>
				<Typography variant="h3">Instructions</Typography>
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
			<FolderDisplayGrid
				columns={columnsMemo}
				onContinue={setFinalizeModalIsOpen}
				hasAccessionApplication={hasAccessionApplication}
				setHasAccessionApplication={setHasAccessionApplication}
			/>
			<FinalizeFilelistModal
				open={finalizeModalIsOpen}
				onClose={handleFinalizeModalClose}
				onSubmit={handleFormSubmit}
				hasAccessionApplication={hasAccessionApplication}
			/>
			<ReturnToHomeModal
				open={returnHomeModalIsOpen}
				onClose={handleReturnHomeModalClose}
				setCurrentPath={(path) => navigate(path)}
			/>
		</Stack>
	);
};
