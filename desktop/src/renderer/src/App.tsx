import {
	AuthProvider,
	NavigateProvider,
	useAppCloseHandler,
	useReleaseNotes,
} from "@/hooks";
import { BrowserRouter } from "react-router";
import { CloseApplicationModal } from "./components";
import { AppLayout } from "./layouts";
import { Routes } from "./routes";
import { VPNMonitor } from "./utilities";

function App(): JSX.Element {
	const { ReleaseNotesModal } = useReleaseNotes();

	const { showClosePrompt, confirmClose, cancelClose } = useAppCloseHandler();

	return (
		<>
			<VPNMonitor>
				<AuthProvider>
					<BrowserRouter>
						<NavigateProvider>
							<AppLayout>
								<Routes />
							</AppLayout>
							<ReleaseNotesModal />
						</NavigateProvider>
					</BrowserRouter>
				</AuthProvider>
			</VPNMonitor>
			<CloseApplicationModal
				open={showClosePrompt}
				onClose={cancelClose}
				onConfirm={confirmClose}
			/>
		</>
	);
}

export default App;
