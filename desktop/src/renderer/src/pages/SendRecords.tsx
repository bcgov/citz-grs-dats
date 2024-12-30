import { Button } from "@bcgov/design-system-react-components";
import { Stack, Typography } from "@mui/material";
import { ListAlt as ListIcon } from "@mui/icons-material";

export const SendRecordsPage = () => {
	return (
		<Stack gap={4}>
			<Typography variant="h2">Send records</Typography>
			<Typography>
				Use DATS to transfer approved, full-retention (FR) digital records to the Digital Archives
				from a LAN drive or EDRMS. This process sends copies of your records to GIM specialists for
				review while keeping your original files intact on your device/drive.
			</Typography>
			<Stack direction="row" gap={3}>
				{/* LAN TRANSFER */}
				<Stack gap={2} sx={{ padding: 2, background: "#FAF9F8" }}>
					<Stack direction="row" spacing={1}>
						<ListIcon sx={{ color: "#474543" }} />
						<Typography variant="h3">Send records from LAN Drive</Typography>
					</Stack>
					<Typography>
						Transfer approved Full Retention (FR) records to the Digital Archives, from a LAN Drive.
					</Typography>
					<Button style={{ width: "fit-content" }}>Start</Button>
				</Stack>
				{/* EDRMS TRANSFER */}
				<Stack gap={2} sx={{ padding: 2, background: "#FAF9F8" }}>
					<Stack direction="row" spacing={1}>
						<ListIcon sx={{ color: "#474543" }} />
						<Typography variant="h3">Send records from EDRMS</Typography>
					</Stack>
					<Typography>
						Transfer approved Full Retention (FR) records to the Digital Archives, from EDRMS.
					</Typography>
					<Button style={{ width: "fit-content" }}>Start</Button>
				</Stack>
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
				<Typography variant="h4">Note on processing time</Typography>
				<Typography>
					Please note that preparing a records transfer can take considerable time. If you wish to
					include large folders (i.e., &gt;5GB, &gt;5000 files) as part of your submission, schedule
					your work to let DATS run for a few hours. We are working on making the services faster in
					future versions of DATS.
				</Typography>
			</Stack>
		</Stack>
	);
};
