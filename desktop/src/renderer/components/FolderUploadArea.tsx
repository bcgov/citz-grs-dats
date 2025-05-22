import { Delete as DeleteIcon, UploadFile as UploadFileIcon } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useNotification } from "@renderer/hooks";
import { useEffect, useState } from "react";

type Props = {
	folderPath?: string | null | undefined;
	onChange: (folderPath: string | null | undefined) => void;
	onDelete: () => void;
};

export const FolderUploadArea = ({ folderPath, onChange, onDelete }: Props) => {
	const [isInvalidFile, setIsInvalidFile] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [api] = useState(window.api); // Preload API

	const { notify } = useNotification();

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			const draggedFile = e.dataTransfer.items[0];
			if (draggedFile.type !== "") setIsInvalidFile(true);
		}
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
		setIsInvalidFile(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		setIsInvalidFile(false);

		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			const item = e.dataTransfer.items[0];

			if (item.type === "") {
				// This will prevent files with an accept type from being dropped but further
				// checks need to be done once the file is choosen to remove anything else that
				// isnt a folder or is an empty folder.
				onChange(e.dataTransfer.files[0].path);
			} else {
				notify.error({
					title: "Wrong file type",
					message: "File type not accepted. Please upload a non-empty folder.",
				});
			}
		}
	};

	const handleSelectFolder = async () => {
		const result = await api.selectDirectory();
		if (result) {
			onChange(result[0]);
		}
	};

	useEffect(() => {
		if (folderPath) {
			const isEmptyFolder = api.utils.isEmptyFolder(folderPath);
			if (isEmptyFolder) {
				onDelete();
				notify.error({
					title: "Wrong file type",
					message: "File type not accepted. Please upload a non-empty folder.",
				});
			}
		}
	}, [folderPath]);

	return (
		<Box
			sx={{
				backgroundColor: isDragging
					? isInvalidFile
						? "var(--file_upload_area-bg-invalid)"
						: "var(--file_upload_area-bg-valid)"
					: "var(--file_upload_area-bg-default)",
				borderColor: isDragging
					? isInvalidFile
						? "var(--file_upload_area-border-invalid)"
						: "var(--file_upload_area-border-valid)"
					: "var(--file_upload_area-border-default)",
				transition: "all 0.25s",
			}}
			height={"15rem"}
			border={"solid 1px"}
			onClick={handleSelectFolder}
			onDrop={handleDrop}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
		>
			<Box
				sx={{
					height: "calc(100% - 8px)",
					display: "flex",
					alignItems: folderPath ? "start" : "center",
					justifyContent: folderPath ? "left" : "center",
				}}
			>
				{folderPath ? (
					<Stack
						direction="row"
						gap={2}
						sx={{
							margin: 2,
							display: "flex",
							alignItems: "center",
							backgroundColor: "var(--file_upload_area-bg-uploaded-file)",
							padding: "16px",
							minWidth: "450px",
							gap: 3,
						}}
					>
						<UploadFileIcon />
						<Stack gap={"4px"}>
							<Typography sx={{ width: "200px" }}>{folderPath}</Typography>
						</Stack>
						<Box
							sx={{
								display: "flex",
								justifyContent: "flex-end",
								width: "100%",
							}}
						>
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									onDelete();
								}}
							>
								<DeleteIcon />
							</IconButton>
						</Box>
					</Stack>
				) : (
					<Stack
						gap={2}
						sx={{
							display: "flex",
							alignItems: "center",
						}}
					>
						<UploadFileIcon />
						<Typography>Choose a folder or drag and drop here</Typography>
						<Typography
							sx={{
								padding: "8px 16px",
								border: "1px solid var(--file_upload_area-border-browse-button)",
								borderRadius: "5px",
								"&:hover": {
									cursor: "pointer",
								},
							}}
						>
							Browse folder
						</Typography>
					</Stack>
				)}
			</Box>
		</Box>
	);
};
