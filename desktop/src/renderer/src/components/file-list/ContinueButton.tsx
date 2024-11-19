import { Button } from "@bcgov/design-system-react-components";

export const ContinueButton = (): JSX.Element => {
	const handleClick = async () => {
		console.log("TODO: THIS");
	};

	return (
		<Button className="file-list-button" type="button" onPress={handleClick}>
			Continue
		</Button>
	);
};
