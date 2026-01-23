import { validateAccessionNumber, validateApplicationNumber } from "@/renderer/utilities";
import { Checkbox, TextField } from "@bcgov/design-system-react-components";
import { Box, FormControlLabel, Stack, Typography } from "@mui/material";

type Props = {
	message: string;
	accession?: string;
	allowAccessionChange: boolean;
	allowApplicationChange: boolean;
	application?: string;
	checked: boolean;
	setAccession: React.Dispatch<React.SetStateAction<string>>;
	setApplication: React.Dispatch<React.SetStateAction<string>>;
	setChecked: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AccAppConfirmation = ({
	message,
	accession,
	setAccession,
	allowAccessionChange,
	application,
	setApplication,
	allowApplicationChange,
	checked,
	setChecked,
}: Props) => {
	const disabled = !(!!accession && !!application) || accession === "" || application === "";

	const textStyles = {
		fontSize: "16px",
		color: !disabled ? "var(--text)" : "var(--text-disabled)",
	};

	return (
		<Stack
			spacing={2}
			sx={{
				padding: "8px 16px",
				backgroundColor: "var(--acc-app-confirmation-bg)",
			}}
		>
			<Typography sx={textStyles}>
				<b>{message}</b>
			</Typography>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					gap: 2,
				}}
			>
				<Stack>
					<b>Accession:</b>

					<TextField
						validate={validateAccessionNumber}
						name="accessionNumber"
						isDisabled={!allowAccessionChange}
						value={accession}
						onChange={setAccession}
					/>
				</Stack>
				<Stack>
					<b>Application:</b>
					<TextField
						validate={validateApplicationNumber}
						name="applicationNumber"
						isDisabled={!allowApplicationChange}
						value={application}
						onChange={setApplication}
					/>
				</Stack>
			</Box>
			<FormControlLabel
				sx={{
					"& .MuiFormControlLabel-label": {
						fontSize: "14px",
						color: !disabled ? "var(--text)" : "var(--text-disabled)",
					},
					color: !disabled ? "var(--text)" : "var(--text-disabled)",
				}}
				required
				control={
					<Checkbox
						style={{ paddingLeft: 0 }}
						isSelected={checked}
						onChange={(isSelected) => setChecked(isSelected)}
						isDisabled={disabled}
					/>
				}
				label="I confirm the accession and application numbers shown above (required)"
			/>
		</Stack>
	);
};
