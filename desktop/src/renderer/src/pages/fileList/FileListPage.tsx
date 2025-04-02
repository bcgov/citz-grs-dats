import { useNavigate } from "@/hooks";
import { PageLayout } from "@renderer/layouts";
import { FileListActionsPage } from "./FileListActions";
import { FileListInstructionsPage } from "./FileListInstructions";

export const FileListPage = () => {
	const { location } = useNavigate();

	console.log("FileListPage location", location.pathname);

	return (
		<PageLayout>
			{location.pathname === "/file-list" && <FileListInstructionsPage />}
			{location.pathname === "/file-list/actions" && <FileListActionsPage />}
		</PageLayout>
	);
};
