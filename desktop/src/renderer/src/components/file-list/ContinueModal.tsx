import { Button, TextField, Form, Select } from "@bcgov/design-system-react-components";
import { Box, Typography, Modal } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 600,
	bgcolor: "background.paper",
	border: "2px solid #000",
	p: 4,
};

const innerBoxStyle = {
	minHeight: "9vh",
	display: "flex",
	justifyContent: "left",
	gap: 1,
	padding: 2,
};

const innerButtonStyle = {
	justifyContent: "center",
	width: "25%",
	height: "10%",
};

export const ContinueModal = ({ modalOpen, modalClose, modalSubmit }) => {
	// setSubmitted controls what modal is being shown, additional information or conformation
	const [submitted, setsubmitted] = useState<boolean>(false);
	const navigate = useNavigate();
	const submitForm = (event) => {
		event.preventDefault();
		const data = Object.fromEntries(new FormData(event.currentTarget));
		modalSubmit(data);
		setsubmitted(true);
	};

	const handleOpen = () => {
		modalOpen;
		return true;
	};

	const ContinueForm = () => {
		return (
			<Form
				onSubmit={(e) => {
					submitForm(e);
				}}
			>
				<Typography sx={{ mt: 1 }} variant="subtitle1">
					You can provide an application and accession number to improve the transfer process.
				</Typography>
				<Typography sx={{ mt: 1 }} variant="subtitle2">
					Entering this information is optional.
				</Typography>
				<Box sx={innerBoxStyle}>
					<TextField name="applicationNumber" label="Application" />
					<TextField name="accentionNumber" label="Accention" />
				</Box>

				<Typography sx={{ mt: 1 }} variant="subtitle1">
					Select a desired output format for your file list
				</Typography>
				<Box sx={innerBoxStyle}>
					<Select
						isRequired
						items={[
							{ id: "1", label: "Excel (.xlsx)" },
							{ id: "2", label: "JSON (.json)" },
							{ id: "3", label: "PDF (.pdf)" },
						]}
						name="outputFormat"
						label="Output format"
					/>
				</Box>

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
					<Button variant="secondary" style={innerButtonStyle} onPress={modalClose}>
						Cancel
					</Button>
					<Button variant="primary" style={innerButtonStyle} type="submit">
						Submit
					</Button>
				</Box>
			</Form>
		);
	};

	const ConfirmSubmit = () => {
		return (
			<Box sx={{ gap: 10, padding: 2 }}>
				<Box>
					<Typography sx={{ mt: 1 }} variant="h5">
						File List Submitted
					</Typography>
					<Typography sx={{ mt: 2 }} variant="h6">
						Your request is being processed. You will receive an email with the generated file list
						shortly.
					</Typography>
				</Box>
				<Box sx={{ gap: 1, padding: 1, mt: 2 }}>
					<Button
						variant="secondary"
						style={{ justifyContent: "center", width: "40%", height: "10%" }}
						onPress={() => {
							navigate("/");
						}}
					>
						Return to Home
					</Button>
				</Box>
			</Box>
		);
	};

	return (
		<Modal open={handleOpen()} onClose={modalClose}>
			<Box sx={modalStyle}>
				{!submitted && <ContinueForm />}
				{submitted && <ConfirmSubmit />}
			</Box>
		</Modal>
	);
};