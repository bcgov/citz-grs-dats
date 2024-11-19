import { Box, useTheme } from "@mui/material";
import {
	FolderDisplayGrid,
	type FolderRow,
	SelectFolderButton,
	ContinueButton,
} from "@renderer/components/file-list";
import { useState } from "react";

export const FileListPage = () => {
	//@ts-ignore
	const [rows, setRows] = useState<FolderRow[]>([]);
	const theme = useTheme();
	const onFolderDelete = (folder: string) => {
		alert(folder); // TBD
	};

	const handleRowChange = (fileList: FolderRow[]): FolderRow[] => {
		try {
			setRows(fileList);
			return fileList;
		} catch (error) {
			setRows([]);
			return [];
		}
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
				<SelectFolderButton />
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
				<FolderDisplayGrid rows={handleRowChange} onFolderDelete={onFolderDelete} />
			</Box>
		</>
	);
};
