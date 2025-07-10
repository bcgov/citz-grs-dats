import { Checkbox } from "@bcgov/design-system-react-components";
import { Box, FormControlLabel, Stack, TextField, Typography } from "@mui/material";

type Props = {
	message: string;
	accession?: string | null;
	allowAccessionChange: boolean;
	allowApplicationChange: boolean;
	application?: string | null;
	checked: boolean;
	setAccession: React.Dispatch<React.SetStateAction<string | null | undefined>>;
	setApplication: React.Dispatch<React.SetStateAction<string | null | undefined>>;
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

	const handleAccessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAccession(e.target.value);
	};

	const handleApplicationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setApplication(e.target.value);
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
						name="accessionNumber"
						disabled={!allowAccessionChange}
						value={accession}
						onChange={handleAccessionChange}
					/>
				</Stack>
				<Stack>
					<b>Application:</b>
					<TextField
						name="applicationNumber"
						disabled={!allowApplicationChange}
						value={application}
						onChange={handleApplicationChange}
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
