import { useAuth, useNavigate, useNotification } from "@/renderer/hooks";
import { Button, Radio, RadioGroup } from "@bcgov/design-system-react-components";
import { Box, Stack, Typography } from "@mui/material";
import { SubAgreementScrollBox } from "@renderer/components";
import { useState } from "react";
import { DeclineSubAgreementModal } from "../DeclineSubAgreementModal";

type Props = {
	accession: string;
	application: string;
	onNextPress: () => void;
	onBackPress: () => void;
};

export const EdrmsSubmissionAgreementView = ({
	accession,
	application,
	onNextPress,
	onBackPress,
}: Props) => {
	const [api] = useState(window.api); // Preload scripts

	const [accept, setAccept] = useState<boolean | null>(null);
	const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);

	const { navigate } = useNavigate();
	const { accessToken } = useAuth();
	const { notify } = useNotification();

	const AgreementBox = () => {
		return (
			<Stack
				spacing={1}
				sx={{
					padding: "8px 16px",
					backgroundColor: "var(--acc-app-confirmation-bg)",
				}}
			>
				<Typography
					sx={{
						color: "var(--text)",
						fontSize: "0.8em",
					}}
				>
					<b>Do you accept the Submission Agreement? (required)</b> *
				</Typography>
				<RadioGroup
					value={accept === null ? null : accept ? "Yes" : "No"}
					onChange={(value) => setAccept(value === "Yes")}
				>
					<Radio
						style={{
							paddingLeft: 0,
							color: "var(--text)",
							fontSize: "0.8em",
						}}
						value="Yes"
					>
						Yes
					</Radio>
					<Radio
						style={{
							paddingLeft: 0,
							color: "var(--text)",
							fontSize: "0.8em",
						}}
						value="No"
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

	const handleConfirmDecline = async () => {
		if (!accessToken) return navigate("/");

		// Request url
		const apiUrl = await api.getCurrentApiUrl();
		const requestUrl = `${apiUrl}/submission-agreement/decline`;

		// Make request
		try {
			const response = await fetch(requestUrl, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					accession,
					application,
				}),
			});

			const jsonResponse = await response.json();
			notify.log(`Submission agreement decline response: ${jsonResponse}`);
		} catch (error) {
			notify.error(error as string);
		}

		navigate("/");
	};

	return (
		<Stack gap={3}>
			<Stack gap={3}>
				<SubAgreementScrollBox accession={accession} application={application} maxHeight="350px" />
				<AgreementBox />
			</Stack>
			<Box sx={{ display: "flex", justifyContent: "space-between" }}>
				<Button variant="secondary" onPress={onBackPress} style={{ width: "fit-content" }}>
					Back
				</Button>
				<Button
					onPress={handleNextPress}
					isDisabled={accept === null}
					style={{ width: "fit-content" }}
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
