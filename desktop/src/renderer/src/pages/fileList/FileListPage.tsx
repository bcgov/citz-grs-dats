import { useNavigate } from "@/hooks";
import { PageLayout } from "@renderer/layouts";
import { FileListActionsPage } from "./FileListActions";
import { FileListOverviewPage } from "./FileListOverview";

export const FileListPage = () => {
	const { location } = useNavigate();

	if (location.pathname === "/file-list")
		return (
			<PageLayout>
				<FileListOverviewPage />
			</PageLayout>
		);

	if (location.pathname === "/file-list/actions")
		return (
			<PageLayout size={[0.5, 11, 0.5]}>
				<FileListActionsPage />
			</PageLayout>
		);

	return null;
};
