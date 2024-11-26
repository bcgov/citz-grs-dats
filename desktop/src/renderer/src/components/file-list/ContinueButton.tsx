import { Button, Tooltip, TooltipTrigger } from "@bcgov/design-system-react-components";

export const ContinueButton = ({ onContinue, isEnabled }): JSX.Element => {
	const ContDisabled = () => {
		return (
			<TooltipTrigger>
				<Button
					variant="secondary"
					style={{ justifyContent: "center", width: "15%", background: "gray" }}
					onPress={onContinue}
					preventFocusOnPress={true}
				>
					Continue
				</Button>
				<Tooltip placement="bottom">
					Ensure folders are selected, loading is completed, and you are logged in before continuing
				</Tooltip>
			</TooltipTrigger>
		);
	};

	const ContEnabled = () => {
		return (
			<Button
				variant="secondary"
				style={{ justifyContent: "center", width: "15%" }}
				onPress={onContinue}
			>
				Continue
			</Button>
		);
	};

	return (
		<>
			{isEnabled && <ContEnabled />}
			{!isEnabled && <ContDisabled />}
		</>
	);
};
