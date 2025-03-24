import {
  AuthProvider,
  NavigateProvider,
  useAppCloseHandler,
  useReleaseNotes,
} from '@/hooks';
import { BrowserRouter } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { CloseApplicationModal, Layout } from './components';
import { Routes } from './routes';
import { VPNMonitor } from './utilities';

function App(): JSX.Element {
	const { ReleaseNotesModal } = useReleaseNotes();

	const { showClosePrompt, confirmClose, cancelClose } = useAppCloseHandler();

	return (
		<VPNMonitor>
			<AuthProvider>
				<BrowserRouter>
					<NavigateProvider>
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
					</NavigateProvider>
				</BrowserRouter>
			</AuthProvider>
		</VPNMonitor>
	);
}

export default App;
