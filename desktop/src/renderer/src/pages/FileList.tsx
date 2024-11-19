import { Box, useTheme } from "@mui/material";
import {
	FolderDisplayGrid,
	type FolderRow,
	SelectFolderButton,
	ContinueButton,
} from "@renderer/components/file-list";
import { useState } from "react";

export const FileListPage = () => {
	const [rows, setRows] = useState<FolderRow[]>([]);
	const theme = useTheme();
	const onFolderDelete = (folder: string) => {
		alert(folder); // TBD
	};

	return (
		<>
			<Box
				sx={{
					minHeight: "7vh",
					display: "flex",
					justifyContent: "flex-end",
					padding: 2,
					flexShrink: 0,
					background: `${theme.palette.primary}`,
				}}
			>
				<SelectFolderButton rows={rows} />
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
				<FolderDisplayGrid rows={rows} onFolderDelete={onFolderDelete} />
			</Box>
		</>
	);
};
