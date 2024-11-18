import { Box } from "@mui/material";
import { FolderDisplayGrid, type FolderRow } from "@renderer/components/file-list";
import { useState } from "react";

export const FileListPage = () => {
	const [rows, setRows] = useState<FolderRow[]>([]);

	const onFolderDelete = (folder: string) => {
		alert(folder); // TBD
	};

	return (
		<Box sx={{ height: "100vh", padding: "60px 1.5%" }}>
			<FolderDisplayGrid rows={rows} onFolderDelete={onFolderDelete} />
		</Box>
	);
};
