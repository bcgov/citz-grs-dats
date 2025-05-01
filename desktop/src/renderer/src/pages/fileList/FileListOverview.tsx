import { useNavigate } from "@renderer/hooks";
import { Button } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";
import { NoteBlock } from "@renderer/components";

export const FileListOverviewPage = () => {
	const { navigate } = useNavigate();

	const handleStartButton = () => navigate("/file-list/actions");

	return (
		<Stack gap={3}>
			<Typography variant="h2">Create file list</Typography>
			<Stack gap={2}>
				<Typography>
					Create a file list for government information stored on a LAN drive. Simply add folder and
					DATS will create a simple list of every sub-folder, document, and key metadata properties
					for you.
				</Typography>
				<Typography>
					Note that a file list created by DATS is required to transfer records from a LAN drive to
					the Digital Archives. But you can also use DATS to create lists to help with analysis for
					clean-ups, destructions, and more!
				</Typography>
			</Stack>
			<Stack gap={2}>
				<Typography variant="h3">Getting started</Typography>
				<Typography>
					If you are creating a file list in order to send records to the Digital Archives, please
					only list Full Retention (FR) records that are ready to transfer.
				</Typography>
				<Typography variant="h4">Eligible records are:</Typography>
				<ul>
					<li>covered by an approved Information Schedule,</li>
					<li>past their Final Disposition (FD) date,</li>
					<li>not part of an active audit, FOI, or legal case.</li>
				</ul>
				<Typography>
					For help with transfers please{" "}
					<a
						href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/records-contacts/ministries"
						target="_blank"
						rel="noreferrer noopener"
					>
						contact your GIM Specialists.
					</a>
				</Typography>
			</Stack>
			{/* Note */}
			<NoteBlock />
			<Box sx={{ display: "flex", justifyContent: "right" }}>
				<Button onPress={handleStartButton} style={{ width: "fit-content" }}>
					Start
				</Button>
			</Box>
		</Stack>
	);
};
