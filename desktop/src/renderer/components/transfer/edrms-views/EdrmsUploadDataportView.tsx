import { Button } from "@bcgov/design-system-react-components";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { FileUploadArea } from "@renderer/components";
import { AccAppConfirmation } from "../AccAppConfirmation";

type Props = {
	file?: File | null;
	setFile: React.Dispatch<React.SetStateAction<File | null | undefined>>;
	accession?: string;
	application?: string;
	confirmChecked: boolean;
	setConfirmChecked: React.Dispatch<React.SetStateAction<boolean>>;
	setAccession: React.Dispatch<React.SetStateAction<string>>;
	setApplication: React.Dispatch<React.SetStateAction<string>>;
	isReadingDataport: boolean;
	onNextPress: () => void;
	onBackPress: () => void;
};

export const EdrmsUploadDataportView = ({
	file,
	setFile,
	accession,
	application,
	confirmChecked,
	setConfirmChecked,
	setAccession,
	setApplication,
	isReadingDataport,
	onNextPress,
	onBackPress,
}: Props) => {
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) setFile(e.target.files[0]);
	};

	const onDrop = (file: File | null | undefined) => {
		if (file) setFile(file);
	};

	const onDelete = () => setFile(undefined);

	return (
		<Stack gap={3}>
			<Stack gap={3}>
				<Typography variant="h3">Upload your dataport file here:</Typography>
				<FileUploadArea
					file={file}
					onChange={onChange}
					onDrop={onDrop}
					onDelete={onDelete}
					accept="text/plain"
				/>
				{isReadingDataport ? (
					<Alert severity="warning" sx={{ backgroundColor: "#fff3cd", color: "#856404" }}>
						Reading the DataPort file in the upload. This may take a moment.
					</Alert>
				) : (
					<AccAppConfirmation
						message="Based on the dataport file you provided:"
						accession={accession}
						application={application}
						checked={confirmChecked}
						setChecked={setConfirmChecked}
						setAccession={setAccession}
						setApplication={setApplication}
						allowAccessionChange={true}
						allowApplicationChange={true}
					/>
				)}
			</Stack>
			<Box sx={{ display: "flex", justifyContent: "space-between" }}>
				<Button variant="secondary" onPress={onBackPress} style={{ width: "fit-content" }}>
					Back
				</Button>
				<Button
					onPress={onNextPress}
					isDisabled={!file || !confirmChecked || isReadingDataport}
					style={{ width: "fit-content" }}
				>
					Next
				</Button>
			</Box>
		</Stack>
	);
};
