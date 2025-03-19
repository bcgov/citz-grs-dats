import { useAppCloseHandler, useNavigateAway, useReleaseNotes } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { CloseApplicationModal, Layout } from './components';
import { Routes } from './routes';
import { AuthProvider, ProgressProvider, VPNMonitor } from './utilities';

function App(): JSX.Element {
	const navigate = useNavigate();

	const { ReleaseNotesModal } = useReleaseNotes();

	const { showClosePrompt, confirmClose, cancelClose } = useAppCloseHandler();

	const { NavigateAwayModal } = useNavigateAway({
		onClose: cancelClose,
		onConfirm: () => navigate('/'),
	});

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
					<ReleaseNotesModal />
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
