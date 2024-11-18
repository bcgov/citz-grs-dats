import { Box, useTheme } from "@mui/material";
import { FolderDisplayGrid, type FolderRow } from "@renderer/components/file-list";
import { useState } from "react";

export const FileListPage = () => {
	const [rows, setRows] = useState<FolderRow[]>([]);
	const theme = useTheme();

	const onFolderDelete = (folder: string) => {
		alert(folder); // TBD
	};

	return (
		<Box
			sx={{
				height: "100vh",
				padding: "60px 1.5%",
				flexShrink: 0,
				background: `${theme.palette.primary}`,
			}}
		>
			<FolderDisplayGrid rows={rows} onFolderDelete={onFolderDelete} />
		</Box>
	);
};
