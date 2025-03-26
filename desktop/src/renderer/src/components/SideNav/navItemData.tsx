import {
  DescriptionOutlined as FileListIcon,
  HomeOutlined as HomeOutlinedIcon,
  DriveFileMoveOutlined as SendRecordsIcon,
  AnalyticsOutlined as ViewStatusIcon
} from '@mui/icons-material';
import type { NavItemProps } from "./NavItem.d";

const navItemData: NavItemProps[] = [
	{
		path: '/',
		label: 'Home',
		icon: <HomeOutlinedIcon sx={{ color: 'var(--sidenav-icon)' }} />,
	},
	{
		path: '/file-list/instructions',
		label: 'Create file list',
		icon: <FileListIcon sx={{ color: 'var(--sidenav-icon)' }} />,
		role: 'any',
	},
	{
		path: '/send-records',
		label: 'Send records',
		icon: <SendRecordsIcon sx={{ color: 'var(--sidenav-icon)' }} />,
		role: 'any',
	},
	{
		path: '/view-transfers',
		label: 'View status',
		icon: <ViewStatusIcon sx={{ color: 'var(--sidenav-icon)' }} />,
		role: 'Archivist',
	},
];

export default navItemData;
