import { validateAccessionNumber, validateApplicationNumber } from "@/renderer/utilities";
import { Button, Form, Select, TextField } from "@bcgov/design-system-react-components";
import { Box, Modal, Stack, Typography, useTheme } from "@mui/material";

type Props = {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: Record<string, FormDataEntryValue>) => void;
	hasAccessionApplication: boolean | null;
};

const innerButtonStyle = {
	justifyContent: "center",
	width: "fit-content",
	height: "10%",
};

const buttonBoxStyle = {
	display: "flex",
	justifyContent: "right",
	gap: 1,
	padding: "16px 24px",
	borderTop: "1px solid var(--modal-border)",
};

const headerStyle = {
	display: "flex",
	justifyContent: "space-between",
	padding: "16px 24px",
	borderBottom: "1px solid var(--modal-border)",
};

const contentStyle = {
	display: "flex",
	flexDirection: "column",
	gap: 3,
	height: "fit-content",
	padding: "0 24px",
	marginBottom: "24px",
};

const NoteBlock = () => {
	const theme = useTheme();
	return (
		<Stack
			sx={{
				padding: 2,
				background: theme.palette.info.main,
				border: "1px solid",
				borderColor: theme.palette.info.dark,
				borderRadius: "5px",
			}}
		>
			<Typography sx={{ fontSize: "16px", fontWeight: 700 }}>Note</Typography>
			<Typography sx={{ fontSize: "16px", color: "var(--text-secondary)" }}>
				DATS will record the above details and they will also appear in the file list. If you are
				transferring Full Retention (FR) records to the digital archives, you must add the accession
				and application numbers to the file list. We recommend you do that here in the app but you
				can also add it later in Excel.
			</Typography>
		</Stack>
	);
};

export const FinalizeFilelistModal = ({
	open,
	onClose,
	onSubmit,
	hasAccessionApplication,
}: Props) => {
	const modalStyle = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		width: hasAccessionApplication ? 800 : 500,
		bgcolor: "background.paper",
		border: "1px solid var(--modal-border)",
		borderRadius: "4px",
		boxShadow: "0px 25.6px 57.6px 0px #00000038, 0px 4.8px 14.4px 0px #0000002E",
	};

	const submitForm = (event) => {
		event.preventDefault();
		const data = Object.fromEntries(new FormData(event.currentTarget));
		onSubmit(data);
	};

	return (
		<Modal open={open} onClose={onClose} disableAutoFocus>
			<Stack gap={3} sx={modalStyle}>
				<Box sx={headerStyle}>
					<Typography variant="h3" sx={{ color: "var(--text)" }}>
						Finalize file list
					</Typography>
				</Box>

				<Form
					onSubmit={(e) => {
						submitForm(e);
					}}
				>
					<Box sx={contentStyle}>
						{hasAccessionApplication && (
							<>
								<Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
									Provide your accession and application numbers
								</Typography>
								<Box
									sx={{
										display: "flex",
										flexDirection: "row",
										gap: 2,
									}}
								>
									<TextField
										validate={validateAccessionNumber}
										name="accessionNumber"
										label="Accession"
										style={{ width: "50%" }}
									/>
									<TextField
										validate={validateApplicationNumber}
										name="applicationNumber"
										label="Application"
										style={{ width: "50%" }}
									/>
								</Box>

								<Typography sx={{ fontSize: "16px" }}>
									You can find your accession and application number on your Transfer form (ARS
									617).
								</Typography>

								<NoteBlock />
							</>
						)}

						<Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
							Select a desired output format for your file list
						</Typography>
						<Select
							isRequired
							items={[
								{ id: "excel", label: "Excel (.xlsx)" },
								{ id: "json", label: "JSON (.json)" },
							]}
							name="outputFormat"
							label="Output format"
							defaultSelectedKey={"excel"}
						/>
					</Box>

					<Box sx={buttonBoxStyle}>
						<Button variant="tertiary" style={innerButtonStyle} onPress={onClose}>
							Cancel
						</Button>
						<Button variant="primary" style={innerButtonStyle} type="submit">
							Submit
						</Button>
					</Box>
				</Form>
			</Stack>
		</Modal>
	);
};
