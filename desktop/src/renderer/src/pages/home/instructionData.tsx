import { Link, Typography } from '@mui/material';
import type { InstructionProps } from '@renderer/components';

const instructionData: InstructionProps[] = [
	{
		num: 1,
		instruction: 'Complete the Transfer Form',
		required: null,
		desc: (
			<Typography sx={{ fontSize: '0.8em' }}>
				Fill in section 1 of the{' '}
				<Link
					href='https://www2.gov.bc.ca/assets/gov/british-columbians-our-governments/services-policies-for-government/information-management-technology/records-management/transfer-storage/ars653.pdf?forcedownload=true'
					target='_blank'
				>
					Transfer Form (ARS 617)
				</Link>{' '}
				to communicate your intent to transfer FR records to the Digital
				Archives.
			</Typography>
		),
	},
	{
		num: 2,
		instruction: 'Create file list',
		required: null,
		desc: (
			<Typography sx={{ fontSize: '0.8em' }}>
				For records on a LAN drive, use DATS to create a Digital File List (ARS
				662). For records in EDRMS CM9, use that application to create a file
				list as per the{' '}
				<Link
					href='https://intranet.gov.bc.ca/thehub/ocio/cirmo/grs/grs-learning'
					target='_blank'
				>
					GIM Learning page
				</Link>
				. For records in other systems{' '}
				<Link
					href='https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/records-contacts'
					target='_blank'
				>
					contact your GIM Specialists
				</Link>
				.
			</Typography>
		),
	},
	{
		num: 3,
		instruction: 'Request a review',
		required: null,
		desc: 'Follow the nums in the Transfer Form (ARS 617) to request a quality assurance review from your GIM Specialists. This ensures the archives only contains high quality records and reduces.',
	},
	{
		num: 4,
		instruction: 'Send records',
		required: null,
		desc: 'Use DATS to securely send the digital FR records to the Digital Archives as evidence.',
	},
];

export default instructionData;
