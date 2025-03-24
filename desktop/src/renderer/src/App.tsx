import { useAppCloseHandler, useReleaseNotes } from '@/hooks';
import { ToastContainer } from 'react-toastify';
import { CloseApplicationModal, Layout } from './components';
import { Routes } from './routes';
import { AuthProvider, ProgressProvider, VPNMonitor } from './utilities';

function App(): JSX.Element {
	const { ReleaseNotesModal } = useReleaseNotes();

	const { showClosePrompt, confirmClose, cancelClose } = useAppCloseHandler();

	const { navigationProvider } = useNavigate();

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
