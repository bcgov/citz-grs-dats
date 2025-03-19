import { Button } from '@bcgov/design-system-react-components';
import { Link, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

type Props = {
	setCurrentPath?:
		| React.Dispatch<React.SetStateAction<string>>
		| ((value: string) => void);
	handleRetrySubmission: () => void;
};

export const RequestFailed = ({
	setCurrentPath,
	handleRetrySubmission,
}: Props) => {
	const navigate = useNavigate();

	return (
		<Stack gap={2}>
			<Typography variant='h3'>Submission failed</Typography>
			<Typography>
				We were unable to send your records to the Digital Archives. Please try
				again.
			</Typography>
			<Stack
				direction='row'
				gap={1}
			>
				<Button
					variant='secondary'
					onPress={() => navigate('/')}
				>
					Return to home
				</Button>
				<Button
					variant='primary'
					onPress={() => handleRetrySubmission()}
				>
					Retry submission
				</Button>
			</Stack>
			<Typography>
				If the issue persist, please contact{' '}
				<Link
					href='mailto:gim@gov.bc.ca'
					target='_blank'
				>
					GIM@gov.bc.ca
				</Link>{' '}
				for assistance.
			</Typography>
		</Stack>
	);
};
