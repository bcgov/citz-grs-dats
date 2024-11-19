import { useState } from "react";
import { type FolderRow } from "./FolderDisplayGrid";

export const SelectFolderButton = (): JSX.Element => {
	const [api] = useState(window.api); // preload scripts

	const pathArrayToFileList = (arrayOfPaths: string[]) => {
		const fileRowList: FolderRow[] = [];
		for (let i = 0; i < arrayOfPaths.length; i++) {
			// for every sring in array convert to folder row and add to new list
			const curFolderRow: FolderRow = {
				id: i,
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
			fileRowList.push(curFolderRow);
		}
		return fileRowList;
	};
	const handleClick = async () => {
		let fileList: FolderRow[];
		const result = await api.selectDirectory();
		if (result.length === 0) {
			// no directory selected
			console.log("No folder selected. Carry on");
			fileList = [];
		} else {
			console.log("folder ", result, " selected.");
			fileList = pathArrayToFileList(result);
		}
		return fileList;
	};

	return (
		<button className="file-list-button" type="button" onClick={handleClick}>
			Select Folders
		</button>
	);
};
