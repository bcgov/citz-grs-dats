import { Button } from "@bcgov/design-system-react-components";

export const ContinueButton = (): JSX.Element => {
	const handleClick = async () => {
		console.log("TODO: THIS");
	};

	return (
		<Button
			variant="primary"
			style={{ justifyContent: "center", width: "15%" }}
			onPress={handleClick}
		>
			Continue
		</Button>
	);
};
