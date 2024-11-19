import { CurrencyBitcoin } from "@mui/icons-material";
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

	function handleAddPathArrayToRows(inPaths) {
		const newRows: FolderRow[] = [...rows];
		let index = rows.length;
		try {
			for (let i = 0; i < inPaths.length; i++) {
				const curFolderRow: FolderRow = {
					id: index,
					folder: inPaths[i],
					schedule: "TestSchedule",
					classification: "TestClassification",
					file: "TestFILE",
					opr: true,
					startDate: null,
					endDate: null,
					soDate: null,
					fdDate: null,
					progress: 0,
				};
				index++;
				newRows.push(curFolderRow);
			}
			setRows(newRows);
		} catch (error) {
			setRows(rows);
			console.log("Hit error");
		}
	}

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
				<FolderDisplayGrid rows={rows} onFolderDelete={onFolderDelete} />
			</Box>
		</>
	);
};
