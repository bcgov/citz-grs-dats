import { useAppCloseHandler, useNavigateAway } from '@/hooks';
import { Header } from '@bcgov/design-system-react-components';
import { Button, Grid2 as Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
	SideNav
} from '../components';

export const Layout = ({ children }) => {
	const navigate = useNavigate();

	const { cancelClose } = useAppCloseHandler();

	const { NavigateAwayModal, openModal: openNavigateAwayModal } =
		useNavigateAway({
			onClose: cancelClose,
			onConfirm: () => navigate('/'),
		});

	return (
		<Grid
			container
			sx={{ height: '100vh' }}
		>
			<Grid size={2}>
				<SideNav />
			</Grid>
			<Grid size={10}>
				<Header
					title='Digital Archives Transfer Service'
					logoLinkElement={<Button onClick={openNavigateAwayModal} />}
				/>
				{children}
				<NavigateAwayModal />
			</Grid>
		</Grid>
	);
};
