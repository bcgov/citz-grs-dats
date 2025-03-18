import { useAppCloseHandler } from '@/hooks';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import {
  CloseApplicationModal,
  Layout,
  ReleaseNotesModal
} from './components';
import { LeavePageModal } from './components/LeavePageModal';
import { Routes } from './routes';
import { AuthProvider, VPNMonitor } from './utilities';
import { ProgressProvider } from './utilities/progress';

// type AppContext = {
	// idToken?: string;
	// accessToken?: string;
	// currentPath: string;
	// setCurrentPath:
		// | React.Dispatch<React.SetStateAction<string>>
		// | ((value: string) => void);
	// setProgressMade:
		// | React.Dispatch<React.SetStateAction<boolean>>
		// | ((value: boolean) => void);
// };

// export const Context = createContext<AppContext>({
	// currentPath: '/',
	// setCurrentPath: () => {},
	// setProgressMade: () => {},
// });

function App(): JSX.Element {
	const [api] = useState(window.api); // Preload scripts

	const [leavePageModalOpen, setLeavePageModalOpen] = useState(false);
	const [releaseNotesModalOpen, setReleaseNotesModalOpen] = useState(false);

	const [appVersion, setAppVersion] = useState<string | null>(null);
	const [releaseNotes, setReleaseNotes] = useState<Record<
		string,
		string
	> | null>(null);

	const { showClosePrompt, confirmClose, cancelClose } = useAppCloseHandler();

	const onConfirmLeavePage = () => {
		setLeavePageModalOpen(false);
		window.location.href = '/';
	};

	useEffect(() => {
		const fetchReleaseNotes = async () => {
			const notes = await api.getReleaseNotes();
			setReleaseNotes(notes);
		};
		const fetchAppVersion = async () => {
			const version = await api.getCurrentAppVersion();
			setAppVersion(version);
		};

		fetchReleaseNotes();
		fetchAppVersion();
	}, []);

	useEffect(() => {
		// Show release notes
		if (appVersion && releaseNotes) {
			setReleaseNotesModalOpen(true);
		}
	}, [appVersion, releaseNotes]);


	const handleCloseReleaseNotesModal = async () => {
		await api.updateViewedReleaseVersion();
		setReleaseNotesModalOpen(false);
	};

	return (
		<VPNMonitor>
			<AuthProvider>
				<ProgressProvider>
					<Layout>
						<Routes />
					</Layout>
					<CloseApplicationModal
						open={showClosePrompt}
						onClose={cancelClose}
						onConfirm={confirmClose}
					/>
					<LeavePageModal
						open={leavePageModalOpen}
						onClose={() => setLeavePageModalOpen(false)}
						onConfirm={onConfirmLeavePage}
					/>
					<ReleaseNotesModal
						open={releaseNotesModalOpen}
						onClose={handleCloseReleaseNotesModal}
						releaseNotes={releaseNotes}
						appVersion={appVersion}
					/>
					<ToastContainer
						position='bottom-left'
						autoClose={4000}
						hideProgressBar
						pauseOnHover
					/>
				</ProgressProvider>
			</AuthProvider>
		</VPNMonitor>
	);
}

export default App;
