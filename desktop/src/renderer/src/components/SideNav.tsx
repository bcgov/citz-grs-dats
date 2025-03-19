import { useNavigateAway } from '@/hooks';
import {
	DescriptionOutlined as FileListIcon,
	HelpOutline as HelpIcon,
	HomeOutlined as HomeOutlinedIcon,
	DriveFileMoveOutlined as SendRecordsIcon,
	AnalyticsOutlined as ViewStatusIcon,
} from '@mui/icons-material';
import {
	Box,
	Divider,
	Drawer,
	List,
	ListItem,
	Stack,
	Typography,
	useTheme,
} from '@mui/material';
import { useAuth } from '@renderer/utilities';
import { type ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthButton } from './AuthButton';
import { HelpModal } from './HelpModal';

type NavItemProps = {
	path: string;
	label: string;
	icon: ReactNode;
};

export const SideNav = () => {
	const [helpModalOpen, setHelpModalOpen] = useState(false);

	const { accessToken, idToken, isArchivist } = useAuth();

	const navigate = useNavigate();
	const location = useLocation();

	const { NavigateAwayModal } = useNavigateAway();

	const NavItem = ({ path, label, icon }: NavItemProps) => {
		const theme = useTheme();

		const currentPath = location.pathname;

		const sx = () => {
			return {
				gap: 1,
				border:
					currentPath === path || (currentPath.startsWith(path) && path !== '/')
						? '2px solid var(--sidenav-item-border-current-page)'
						: '2px solid transparent',
				borderRadius: '5px',
				background:
					currentPath === path || (currentPath.startsWith(path) && path !== '/')
						? theme.palette.secondary.light
						: 'none',
				'&:hover': {
					background: theme.palette.secondary.dark,
				},
			};
		};
		return (
			<ListItem
				sx={sx}
				component='button'
				onClick={() => navigate(path)}
			>
				{icon}
				<Typography>{label}</Typography>
			</ListItem>
		);
	};

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
						<NavItem
							path='/'
							label='Home'
							icon={<HomeOutlinedIcon sx={{ color: 'var(--sidenav-icon)' }} />}
						/>
						<Divider sx={{ margin: '5px 0' }} />
						{/* REQUIRE AUTH */}
						{accessToken && (
							<>
								<NavItem
									path='/file-list/instructions'
									label='Create file list'
									icon={<FileListIcon sx={{ color: 'var(--sidenav-icon)' }} />}
								/>
								<NavItem
									path='/send-records'
									label='Send records'
									icon={
										<SendRecordsIcon sx={{ color: 'var(--sidenav-icon)' }} />
									}
								/>
								{isArchivist && (
									<NavItem
										path='/view-transfers'
										label='View status'
										icon={
											<ViewStatusIcon sx={{ color: 'var(--sidenav-icon)' }} />
										}
									/>
								)}
							</>
						)}
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
			<NavigateAwayModal />
			<HelpModal
				open={helpModalOpen}
				onClose={() => setHelpModalOpen(false)}
			/>
		</>
	);
};
