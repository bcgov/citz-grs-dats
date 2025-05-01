import { useNavigate } from "@renderer/hooks";
import { Stack, Typography } from "@mui/material";
import { FolderDisplayGrid, Instruction, ReturnToHomeModal } from "@renderer/components";
import { useMemo, useState } from "react";
import { columns } from "./columns";

export const FileListActionsPage = () => {
	const columnsMemo = useMemo(() => columns || [], [columns]);

	const [returnHomeModalIsOpen, setReturnHomeModalIsOpen] = useState<boolean>(false);

	const { navigate } = useNavigate();

	const handleReturnHomeModalClose = () => setReturnHomeModalIsOpen(false);

	const handleCompletion = () => {
		setReturnHomeModalIsOpen(true);
	};

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
			<FolderDisplayGrid columns={columnsMemo} onComplete={handleCompletion} />
			<ReturnToHomeModal
				open={returnHomeModalIsOpen}
				onClose={handleReturnHomeModalClose}
				setCurrentPath={(path) => navigate(path)}
			/>
		</Stack>
	);
};
