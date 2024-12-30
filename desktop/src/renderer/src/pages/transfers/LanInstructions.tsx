import { Button } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";

export const LanInstructionsPage = () => {
	return (
		<Stack gap={3}>
			<Typography variant="h2">LAN drive transfer</Typography>
			<Stack gap={2}>
				<Typography variant="h3">Getting started</Typography>
				<Typography>
					Before you start your LAN drive transfer process, ensure you have the following documents:
				</Typography>
				<ul>
					<li>Transfer form (ARS 617)</li>
					<li>Digital file list (ARS 622)</li>
				</ul>
				<Typography>
					You should also be ready to relink any folders whose names have changed since your file
					list was created.
				</Typography>
			</Stack>
			{/* Note */}
			<Stack
				gap={2}
				sx={{
					padding: 2,
					background: "#F7F9FC",
					border: "1px solid #053662",
					borderRadius: "5px",
				}}
			>
				<Typography variant="h4">For an optimal experience...</Typography>
				<ul>
					<li>
						Keep the DATS app open for the duration of the LAN drive transfer process, including
						during long file uploading times.
					</li>
					<li>Do not navigate away from the transfer until it is complete.</li>
				</ul>
				<Typography variant="h4">
					Closing the application or navigating elsewhere in DATS during your transfer process will
					terminate the transfer. Progress will not be saved.
				</Typography>
			</Stack>
			<Box sx={{ display: "flex", justifyContent: "right" }}>
				<Button style={{ width: "fit-content" }}>Start</Button>
			</Box>
		</Stack>
	);
};
