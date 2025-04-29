import {
  ListAlt as ListIcon,
  AnalyticsOutlined as ViewStatusIcon,
} from '@mui/icons-material';
import {
  TransferRecordsIcon,
  type PageLinkProps
} from '@renderer/components';

const pageLinkData: PageLinkProps[] = [
	{
		title: 'Create file list',
		icon: <ListIcon />,
		desc: 'Use DATS to create a Digital File List (ARS 662). A digital file list is required to transfer records to the Digital Archives from a LAN drive.',
		buttonText: 'Create file list',
		pageRoute: '/file-list',
	},
	{
		title: 'Transfer records',
		icon: <TransferRecordsIcon />,
		desc: 'Use DATS to securely transfer your digital FR records to the Digital Archives from either a LAN Drive or EDRMS Content Manager v.9.2.',
		buttonText: 'Send records',
		pageRoute: '/send-records',
	},
	{
		title: 'View transfer status',
		icon: <ViewStatusIcon />,
		desc: 'View transfers sent to the Digital Archives via DATS.',
		buttonText: 'View transfer status',
		pageRoute: '/view-transfers',
		role: 'Archivist',
	},
];

export default pageLinkData;
