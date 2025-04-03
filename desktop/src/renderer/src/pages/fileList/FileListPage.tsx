import { useNavigate } from "@/hooks";
import { PageLayout } from "@renderer/layouts";
import { FileListActionsPage } from "./FileListActions";
import { FileListOverviewPage } from "./FileListOverview";

export const FileListPage = () => {
	const { location } = useNavigate();

	return (
		<PageLayout>
			{location.pathname === "/file-list" && <FileListOverviewPage />}
			{location.pathname === "/file-list/actions" && <FileListActionsPage />}
		</PageLayout>
	);
};
