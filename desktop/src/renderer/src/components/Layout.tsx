import { Header } from '@bcgov/design-system-react-components';
import { Box, Button, Grid2 as Grid } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import {
	CloseApplicationModal,
	ReleaseNotesModal,
	SideNav,
	Toast,
} from '../components';
import { useAuth } from '../utilities';

//TODO: SideNav props to be fixed && fix header icon link

export const Layout = ({ children }) => {
	const { accessToken, idToken } = useAuth();
	return (
		<Grid
			container
			sx={{ height: '100vh' }}
		>
			<Grid size={2}>
				<SideNav
					accessToken={accessToken}
					idToken={idToken}
					currentPath={'/'}
					setCurrentPath={() => {}}
					progressMade={false}
				/>
			</Grid>
			<Grid size={10}>
				<Header
					title='Digital Archives Transfer Service'
					// logoLinkElement={
					// 	<Button onClick={() => setLeavePageModalOpen(true)} />
					// }
				/>
				{children}
			</Grid>
		</Grid>
	);
};
