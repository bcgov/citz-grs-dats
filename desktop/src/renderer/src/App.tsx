import { useAppCloseHandler, useReleaseNotes } from '@/hooks';
import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import {
  CloseApplicationModal,
  Layout,
  LeavePageModal,
  ReleaseNotesModal
} from './components';
import { Routes } from './routes';
import { AuthProvider, ProgressProvider, VPNMonitor } from './utilities';

function App(): JSX.Element {
	const [api] = useState(window.api); // Preload scripts

	const [leavePageModalOpen, setLeavePageModalOpen] = useState(false);

  const releaseNotesHook = useReleaseNotes();

	const { showClosePrompt, confirmClose, cancelClose } = useAppCloseHandler();

	const onConfirmLeavePage = () => {
		setLeavePageModalOpen(false);
		window.location.href = '/';
	};

	const handleCloseReleaseNotesModal = async () => {
		await api.updateViewedReleaseVersion();
		releaseNotesHook.closeModal();
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
						open={releaseNotesHook.showModal}
						onClose={handleCloseReleaseNotesModal}
						releaseNotes={releaseNotesHook.releaseNotes}
						appVersion={releaseNotesHook.appVersion}
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
