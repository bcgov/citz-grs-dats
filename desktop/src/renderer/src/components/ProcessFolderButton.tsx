import { useState } from "react";

export const ProcessFolderButton = (): JSX.Element => {
	const [workers] = useState(window.api.workers); // Preload scripts
	const filePath = "D:\\test-folders\\100";
	//const filePath = "/Volumes/Digital-Archives/test-folders/100";
	const transfer = "TR_0000_0000";

	const handleClick = async () => {
		await workers.copyFolderAndMetadata({ filePath, transfer });
	};

	return (
		<button type="button" onClick={handleClick}>
			Process Folders Test
		</button>
	);
};
