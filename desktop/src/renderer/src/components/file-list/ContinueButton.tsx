import { Button } from "@bcgov/design-system-react-components";

export const ContinueButton = ({ onContinue }): JSX.Element => {
	return (
		<>
			<Button
				variant="primary"
				style={{ justifyContent: "center", width: "15%" }}
				onPress={onContinue}
			>
				Continue
			</Button>
		</>
	);
};
