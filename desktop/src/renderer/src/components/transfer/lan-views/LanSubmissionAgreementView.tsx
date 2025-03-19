import {
	Button,
	Radio,
	RadioGroup,
} from '@bcgov/design-system-react-components';
import { Box, Stack, Typography } from '@mui/material';
import { SubAgreementScrollBox } from '@renderer/components';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DeclineSubAgreementModal } from '../DeclineSubAgreementModal';

type Props = {
	accession: string;
	application: string;
	onNextPress: () => void;
	onBackPress: () => void;
	setCurrentPath?:
		| React.Dispatch<React.SetStateAction<string>>
		| ((value: string) => void);
};

export const LanSubmissionAgreementView = ({
	accession,
	application,
	onNextPress,
	onBackPress,
	setCurrentPath,
}: Props) => {
	const [accept, setAccept] = useState<boolean | null>(null);
	const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);

	const navigate = useNavigate();

	const AgreementBox = () => {
		return (
			<Stack
				spacing={1}
				sx={{
					padding: '8px 16px',
					backgroundColor: 'var(--acc-app-confirmation-bg)',
				}}
			>
				<Typography
					sx={{
						color: 'var(--text)',
						fontSize: '0.8em',
					}}
				>
					<b>Do you accept the Submission Agreement? (required)</b> *
				</Typography>
				<RadioGroup
					value={accept === null ? null : accept ? 'Yes' : 'No'}
					onChange={(value) => setAccept(value === 'Yes')}
				>
					<Radio
						style={{
							paddingLeft: 0,
							color: 'var(--text)',
							fontSize: '0.8em',
						}}
						value='Yes'
					>
						Yes
					</Radio>
					<Radio
						style={{
							paddingLeft: 0,
							color: 'var(--text)',
							fontSize: '0.8em',
						}}
						value='No'
					>
						No
					</Radio>
				</RadioGroup>
			</Stack>
		);
	};

	const handleNextPress = () => {
		if (accept) return onNextPress();
		setShowDeclineModal(true);
	};

	const handleConfirmDecline = () => {
		navigate('/');
	};

	return (
		<Stack gap={3}>
			<Stack gap={2}>
				<SubAgreementScrollBox
					accession={accession}
					application={application}
					maxHeight='350px'
				/>
				<AgreementBox />
			</Stack>
			<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
				<Button
					variant='secondary'
					onPress={onBackPress}
					style={{ width: 'fit-content' }}
				>
					Back
				</Button>
				<Button
					onPress={handleNextPress}
					isDisabled={accept === null}
					style={{ width: 'fit-content' }}
				>
					Next
				</Button>
			</Box>
			<DeclineSubAgreementModal
				open={showDeclineModal}
				onClose={() => setShowDeclineModal(false)}
				onConfirm={handleConfirmDecline}
			/>
		</Stack>
	);
};
