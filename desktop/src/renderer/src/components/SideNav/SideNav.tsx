import { useAuth } from '@/hooks';
import {
	HelpOutline as HelpIcon
} from '@mui/icons-material';
import {
	Box,
	Divider,
	Drawer,
	List,
	Stack,
	Typography
} from '@mui/material';
import { AuthButton, HelpModal } from '@renderer/components';
import { useState } from 'react';

import { NavItem } from './NavItem';
import type { NavItemProps } from './NavItem.d';
import navItemData from './navItemData';


export const SideNav = () => {
	const [helpModalOpen, setHelpModalOpen] = useState(false);

	const { accessToken, idToken } = useAuth();

	return (
		<>
			<Drawer
				variant='permanent'
				sx={{
					height: '100%',
					maxHeight: '100vh',
					'& .MuiDrawer-paper': {
						position: 'fixed',
						width: '17%',
						boxSizing: 'border-box',
						padding: 1,
					},
				}}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						height: '100%',
					}}
				>
					<List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						{navItemData.map((item: NavItemProps) => (
							<NavItem
								key={item.label}
								{...item}
							/>
						))}
					</List>
					<Stack gap={2}>
						<button
							type='button'
							style={{
								background: 'transparent',
								border: 'none',
								width: 'fit-content',
								cursor: 'pointer',
							}}
							onClick={() => setHelpModalOpen(!helpModalOpen)}
						>
							<Stack
								direction='row'
								gap={1}
							>
								<HelpIcon />
								<Typography>Help</Typography>
							</Stack>
						</button>
						<Divider />
						<AuthButton
							accessToken={accessToken}
							idToken={idToken}
						/>
					</Stack>
				</Box>
			</Drawer>
			<HelpModal
				open={helpModalOpen}
				onClose={() => setHelpModalOpen(false)}
			/>
		</>
	);
};
