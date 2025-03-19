import { Button } from '@bcgov/design-system-react-components';
import { Box, Grid2 as Grid, Stack, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router';

export const FileListInstructionsPage = () => {
	const theme = useTheme();

	const navigate = useNavigate();

	const goToFileListPage = () => navigate('/file-list');

	const NoteBlock = () => {
		return (
			<Stack
				gap={2}
				sx={{
					padding: 2,
					background: theme.palette.info.main,
					border: '1px solid',
					borderColor: theme.palette.info.dark,
					borderRadius: '5px',
				}}
			>
				<Typography variant='h4'>Note</Typography>
				<Typography>
					Please note that this process can take considerable time. If you have
					a large transfer (i.e., &gt;5GB, &gt;5000 files), schedule your work
					to let DATS run for a few hours. We are working on making the services
					faster in future versions of DATS.
				</Typography>
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
				<Stack gap={3}>
					<Typography variant='h2'>Create file list</Typography>
					<Stack gap={2}>
						<Typography>
							Create a file list for government information stored on a LAN
							drive. Simply add folder and DATS will create a simple list of
							every sub-folder, document, and key metadata properties for you.
						</Typography>
						<Typography>
							Note that a file list created by DATS is required to transfer
							records from a LAN drive to the Digital Archives. But you can also
							use DATS to create lists to help with analysis for clean-ups,
							destructions, and more!
						</Typography>
					</Stack>
					<Stack gap={2}>
						<Typography variant='h3'>Getting started</Typography>
						<Typography>
							If you are creating a file list in order to send records to the
							Digital Archives, please only list Full Retention (FR) records
							that are ready to transfer.
						</Typography>
						<Typography variant='h4'>Eligible records are:</Typography>
						<ul>
							<li>covered by an approved Information Schedule,</li>
							<li>past their Final Disposition (FD) date,</li>
							<li>not part of an active audit, FOI, or legal case.</li>
						</ul>
						<Typography>
							For help with transfers please{' '}
							<a
								href='https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/records-contacts/ministries'
								target='_blank'
								rel='noreferrer noopener'
							>
								contact your GIM Specialists.
							</a>
						</Typography>
					</Stack>
					{/* Note */}
					<NoteBlock />
					<Box sx={{ display: 'flex', justifyContent: 'right' }}>
						<Button
							onPress={goToFileListPage}
							style={{ width: 'fit-content' }}
						>
							Start
						</Button>
					</Box>
				</Stack>
			</Grid>
			<Grid size={2} />
		</Grid>
	);
};
