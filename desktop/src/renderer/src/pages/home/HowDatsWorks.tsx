import { Stack, Typography } from '@mui/material';
import { Accordion, AccordionDetails, AccordionSummary, Instruction } from '@renderer/components';
import * as React from 'react';
import instructionData from './instructionData';

export const HowDatsWorks = () => {
	const [expanded, setExpanded] = React.useState<string | false>(false);

	const handleChange =
		(panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
			setExpanded(newExpanded ? panel : false);
		};

	return (
		<Accordion
			expanded={expanded === 'panel1'}
			onChange={handleChange('panel1')}
		>
			<AccordionSummary
				aria-controls='how-records-transfer-works-accordion'
				id='panel1d-header'
			>
				<Typography component='span'>How records transfer works</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack gap={2}>
					<Typography>
						These are the main steps to transfer FR records to the archives:
					</Typography>

					{instructionData.map((instruction) => {
						return (
							<Instruction
								key={instruction.num}
								{...instruction}
							/>
						);
					})}
				</Stack>
			</AccordionDetails>
		</Accordion>
	);
};
