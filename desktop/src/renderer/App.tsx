import { useEffect, useState } from "react";
import {
	AuthProvider,
	NavigateProvider,
	useAppCloseHandler,
	useReleaseNotes,
} from "@/renderer/hooks";
import { HashRouter } from "react-router";
import { CloseApplicationModal, ConfigureProcessingModal } from "./components";
import { AppLayout } from "./layouts";
import { Routes } from "./routes";
import { VPNMonitor } from "./utilities";

const AppClosePrompt = () => {
	const { showClosePrompt, confirmClose, cancelClose } = useAppCloseHandler();

	return (
		<CloseApplicationModal
			open={showClosePrompt}
			onClose={cancelClose}
			onConfirm={confirmClose}
		/>
	);
};

function App(): JSX.Element {
	const { ReleaseNotesModal } = useReleaseNotes();

	const [showConfigureProcessing, setShowConfigureProcessing] = useState(false);

	useEffect(() => {
		const handler = () => setShowConfigureProcessing(true);
		window.api.onOpenConfigureProcessing(handler);
		return () => {
			window.removeEventListener("open-configure-processing", handler);
		};
	}, []);

	return (
		<>
			<VPNMonitor>
				<AuthProvider>
					<HashRouter>
						<NavigateProvider>
							<AppLayout>
								<Routes />
							</AppLayout>
							<ReleaseNotesModal />
							<AppClosePrompt />
						</NavigateProvider>
					</HashRouter>
				</AuthProvider>
			</VPNMonitor>
			<ConfigureProcessingModal
				open={showConfigureProcessing}
				onClose={() => setShowConfigureProcessing(false)}
			/>
		</>
	);
}

export default App;
