import { useAppCloseHandler, useReleaseNotes, useNavigateAway } from '@/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { CloseApplicationModal, Layout, ReleaseNotesModal } from './components';
import { Routes } from './routes';
import { AuthProvider, ProgressProvider, VPNMonitor } from './utilities';

function App(): JSX.Element {
	const [api] = useState(window.api); // Preload scripts

	const navigate = useNavigate();

	const releaseNotesHook = useReleaseNotes();

	const { showClosePrompt, confirmClose, cancelClose } = useAppCloseHandler();

	const { NavigateAwayModal } = useNavigateAway({
		onClose: cancelClose,
		onConfirm: () => navigate('/'),
	});

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
					<NavigateAwayModal />
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
