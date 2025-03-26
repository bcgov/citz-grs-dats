import {
	Box,
	Grid2 as Grid,
	Link,
	Stack,
	Typography,
	useTheme,
} from '@mui/material';
import {
	PageLinkCard
} from '@renderer/components';
import { HowDatsWorks } from './HowDatsWorks';
import pageLinkData from './pageLinkData';

export const HomePage = () => {
	const theme = useTheme();

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

					{pageLinkData.map((card) => {
						return (
							<PageLinkCard
								key={card.title}
								{...card}
							/>
						);
					})}

					<HowDatsWorks />

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
