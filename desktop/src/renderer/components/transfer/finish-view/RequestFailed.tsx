import { Button } from "@bcgov/design-system-react-components";
import { Link, Stack, Typography } from "@mui/material";
import { useNavigate } from "@/renderer/hooks";

type Props = {
	handleRetrySubmission: () => void;
};

export const RequestFailed = ({ handleRetrySubmission }: Props) => {
	const { navigate } = useNavigate();
	const dateString = new Date().toLocaleString("en-CA", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	return (
		<Stack gap={3}>
			<Typography variant="h3">Submission failed</Typography>
			<Typography>
				We were unable to send your records to the Digital Archives. Please try again.
			</Typography>
			<Stack direction="row" gap={1}>
				<Button variant="secondary" onPress={() => navigate("/")}>
					Return to home
				</Button>
				<Button variant="primary" onPress={() => handleRetrySubmission()}>
					Retry submission
				</Button>
			</Stack>
			<Typography>
				If the issue persist, please contact{" "}
				<Link href="mailto:gim@gov.bc.ca" target="_blank">
					GIM@gov.bc.ca
				</Link>{" "}
				for assistance.
			</Typography>
			<Typography>{dateString}</Typography>
		</Stack>
	);
};
