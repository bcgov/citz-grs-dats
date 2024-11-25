import { Button, TextField, Form, Select } from "@bcgov/design-system-react-components";
import { Modal, Box, Typography } from "@mui/material";
import { useState } from "react";

const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 600,
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: 24,
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

export const ContinueButton = ({ rows }): JSX.Element => {
	// state controls continue modal
	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		if (rows.length <= 0) {
			console.log("No rows selected");
			setOpen(false);
		} else {
			setOpen(true);
		}
	};
	const handleClose = () => setOpen(false);

	const ContinueModal = () => {
		return (
			<Form>
				<Typography sx={{ mt: 1 }} variant="subtitle1">
					You can provide an application and accession number to improve the transfer process.
				</Typography>
				<Typography sx={{ mt: 1 }} variant="subtitle2">
					Entering this information now is optional.
				</Typography>
				<Box sx={innerBoxStyle}>
					<TextField label="Application" />
					<TextField label="Accention" />
				</Box>

				<Typography sx={{ mt: 1 }} variant="subtitle1">
					Select a desired output format for your file list
				</Typography>
				<Box sx={innerBoxStyle}>
					<Select
						items={[
							{ id: "1", label: "Excel (.xlsx)" },
							{ id: "2", label: "JSON (.json)" },
							{ id: "3", label: "PDF (.pdf)" },
						]}
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
					<Button variant="secondary" style={innerButtonStyle} onPress={handleClose}>
						Cancel
					</Button>
					<Button variant="primary" style={innerButtonStyle} onPress={handleOpen}>
						Submit
					</Button>
				</Box>
			</Form>
		);
	};

	return (
		<>
			<Button
				variant="primary"
				style={{ justifyContent: "center", width: "15%" }}
				onPress={handleOpen}
			>
				Continue
			</Button>
			<Modal open={open} onClose={handleClose}>
				<Box sx={modalStyle}>
					<ContinueModal />
				</Box>
			</Modal>
		</>
	);
};
