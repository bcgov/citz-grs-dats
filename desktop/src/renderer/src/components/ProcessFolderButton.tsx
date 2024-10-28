import { useState } from "react";

export const ProcessFolderButton = (): JSX.Element => {
	const [workers] = useState(window.api.workers); // Preload scripts
	const filePath = "D:\\test-folders\\100";

	const handleClick = async () => {
		await workers.processFolder({ filePath });
	};

	return (
		<button type="button" onClick={handleClick}>
			Process Folders Test
		</button>
	);
};
