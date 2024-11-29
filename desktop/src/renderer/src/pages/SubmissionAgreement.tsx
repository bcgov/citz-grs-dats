import { Button, Form, TextField } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography, useTheme } from "@mui/material";

const innerButtonStyle = {
	justifyContent: "center",
	width: "15%",
	height: "10%",
};

export const SubmissionAgreementPage = () => {
	const theme = useTheme();

	const submitForm = (event) => {
		event.preventDefault();
		//const data = Object.fromEntries(new FormData(event.currentTarget));
	};

	return (
		<Stack
			sx={{
				height: "100vh",
				padding: 8,
				flexShrink: 0,
				background: `${theme.palette.primary}`,
			}}
			gap={3}
		>
			<Stack gap={2}>
				<Typography variant="h3">
					A submission agreement is an agreement between BC's Digital Archives and the Ministry
					which outlines the transfer of government records under the specified Accession and
					Application numbers.
				</Typography>
				<Typography variant="h3">
					Filling out the agreement from this page is{" "}
					<b>only required before sending records over the API</b>. You will be prompted for the
					agreement during the process to send records from LAN or EDRMS.
				</Typography>
			</Stack>

			<Form onSubmit={submitForm}>
				<Stack gap={3} direction="row">
					<TextField name="accessionNumber" label="Accession #" />
					<TextField name="applicationNumber" label="Application #" />
				</Stack>

				<Box
					sx={{
						minHeight: "10vh",
						display: "flex",
						justifyContent: "right",
						gap: 1,
						padding: 2,
						flexShrink: 0,
					}}
				>
					<Button variant="primary" style={innerButtonStyle} type="submit">
						Continue
					</Button>
				</Box>
			</Form>
		</Stack>
	);
};
