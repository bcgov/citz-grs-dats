import { useState } from "react";

export const SelectFolderButton = ({ onRowChange }): JSX.Element => {
	const [api] = useState(window.api); // preload scripts

	const handleClick = async () => {
		const result = await api.selectDirectory();

		onRowChange(result);
		return result;
	};

	return (
		<button className="file-list-button" type="button" onClick={handleClick}>
			Select Folders
		</button>
	);
};
