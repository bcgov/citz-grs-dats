import { useState } from "react";
import { Button } from "@bcgov/design-system-react-components";

export const SelectFolderButton = ({ onRowChange }): JSX.Element => {
	const [api] = useState(window.api); // preload scripts

	const handleClick = async () => {
		const result = await api.selectDirectory();

		onRowChange(result);
		return result;
	};

	return (
		<Button
			variant="primary"
			style={{ justifyContent: "center", width: "15%" }}
			onPress={handleClick}
		>
			Select Folders
		</Button>
	);
};
