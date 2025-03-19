import { Button } from '@bcgov/design-system-react-components';
import {
  ListAlt as ListIcon,
  AnalyticsOutlined as ViewStatusIcon,
} from '@mui/icons-material';
import {
  Box,
  Grid2 as Grid,
  Link,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { TransferRecordsIcon } from '@renderer/components';
import HomeDatsWorksAccordion from '@renderer/components/HowDatsWorksAccordion';
import { useAuth } from '@renderer/utilities';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
	const [sso] = useState(window.api.sso); // Preload scripts
	const theme = useTheme();

	const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
		null,
	);

	const navigate = useNavigate();

	const handleLogin = async () => await sso.startLoginProcess();

  const { accessToken} = useAuth();

	const user = sso.getUser(accessToken);
	const isArchivist = user?.hasRoles(['Archivist']) ?? false;

	type PageLinkProps = {
		title: string;
		icon: ReactNode;
		desc: string;
		buttonText: string;
		pageRoute: string;
	};

	const handleGoToPage = (page: string) => {
		if (accessToken) navigate(page);
		else {
			setRedirectAfterLogin(page);
			handleLogin();
		}
	};

	useEffect(() => {
		// Redirect after login
		if (accessToken && redirectAfterLogin) navigate(redirectAfterLogin);
	}, [accessToken]);

	const PageLinkCard = ({
		title,
		icon,
		desc,
		buttonText,
		pageRoute,
	}: PageLinkProps) => {
		return (
			<Stack
				gap={2}
				sx={{ padding: '16px', background: '#FAF9F8' }}
			>
				<Stack
					direction='row'
					gap={1}
					sx={{ alignItems: 'center' }}
				>
					{icon}
					<Typography variant='h4'>{title}</Typography>
				</Stack>
				<Typography sx={{ fontSize: '0.9em' }}>{desc}</Typography>
				<Button
					variant='primary'
					style={{ width: 'fit-content' }}
					onPress={() => handleGoToPage(pageRoute)}
				>
					{buttonText}
				</Button>
			</Stack>
		);
	};

	return (
		<Grid container>
			<Grid size={2} />
			<Grid
				size={8}
				sx={{ paddingTop: 3 }}
			>
				<Stack
					sx={{
						padding: 4,
						flexShrink: 0,
						background: `${theme.palette.primary}`,
						marginBottom: 3,
						marginTop: '-15px',
					}}
					gap={3}
				>
					<Typography
						variant='h1'
						sx={{ fontWeight: 600, color: '#474543' }}
					>
						Welcome to DATS
					</Typography>
					<Typography variant='h3'>
						Digital Archives Transfer Service
					</Typography>

					<Box>
						<Typography>
							The Digital Archives Transfer Service (DATS) is a secure, evidence
							handling application that helps you:
						</Typography>
						<ul>
							<li>
								send your Full Retention (FR) archival records to the Digital
								Archives; and
							</li>
							<li>
								create digital file lists that include checksums and metadata.
							</li>
						</ul>
					</Box>

					<Typography sx={{ fontStyle: 'italic' }}>
						To use DATS you must be connected to the network via VPN and logged
						into the DATS Application.
					</Typography>

					<PageLinkCard
						title='Create file list'
						icon={<ListIcon />}
						buttonText='Create file list'
						desc='Use DATS to create a Digital File List (ARS 662). A digital file list is required to transfer records to the Digital Archives from a LAN drive.'
						pageRoute='/file-list/instructions'
					/>
					<PageLinkCard
						title='Transfer records'
						icon={<TransferRecordsIcon />}
						buttonText='Send records'
						desc='Use DATS to securely transfer your digital FR records to the Digital Archives from either a LAN Drive or EDRMS Content Manager v.9.2.'
						pageRoute='/send-records'
					/>

					{isArchivist && (
						<PageLinkCard
							title='View transfer status'
							icon={<ViewStatusIcon />}
							buttonText='View transfer status'
							desc='View transfers sent to the Digital Archives via DATS.'
							pageRoute='/view-transfers'
						/>
					)}

					<HomeDatsWorksAccordion />

					<Typography>
						If you want to learn more about the process,{' '}
						<Link
							href='https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/records-contacts'
							target='_blank'
						>
							contact your GIM Specialists
						</Link>{' '}
						or check out{' '}
						<Link
							href='https://intranet.gov.bc.ca/thehub/ocio/cirmo/grs/grs-learning'
							target='_blank'
						>
							GIM Learning
						</Link>
						.
					</Typography>
				</Stack>
			</Grid>
			<Grid size={2} />
		</Grid>
	);
};
