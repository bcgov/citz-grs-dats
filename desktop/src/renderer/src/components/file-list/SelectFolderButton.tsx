import { useState } from "react";
import type { FolderRow } from "./FolderDisplayGrid";

export const SelectFolderButton = (rows): JSX.Element => {
	const [api] = useState(window.api); // preload scripts

	const pathArrayToFileList = (arrayOfPaths: string[]) => {
		let newRows: FolderRow[] = [];
		if (rows.currentRows.length > 0) newRows = rows.currentRows.slice();

		let index = rows.currentRows.length;
		for (let i = 0; i < arrayOfPaths.length; i++) {
			// for every sring in array convert to folder row and add to new list
			const curFolderRow: FolderRow = {
				id: index,
				folder: arrayOfPaths[i],
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
		return newRows;
	};
	const handleClick = async () => {
		let fileList: FolderRow[];
		const result = await api.selectDirectory();
		if (result.length === 0) {
			// no directory selected just return what we already had
			fileList = rows.currentRows;
		} else {
			// add new directory to any current 'rows'
			fileList = pathArrayToFileList(result);
		}

		rows.setRows(fileList);
		return fileList;
	};

	return (
		<button className="file-list-button" type="button" onClick={handleClick}>
			Select Folders
		</button>
	);
};
