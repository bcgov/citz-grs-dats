import { Button, Tooltip, TooltipTrigger } from "@bcgov/design-system-react-components";

export const ContinueButton = ({ onContinue, isEnabled }): JSX.Element => {
	const ContDisabled = () => {
		return (
			<TooltipTrigger delay={0}>
				<Button
					className="disabled-button"
					variant="primary"
					style={{ minWidth: "15%" }}
					preventFocusOnPress={true}
				>
					Continue
				</Button>
				<Tooltip placement="bottom">
					Ensure folders are selected, loading is complete, and you are logged in before continuing.
				</Tooltip>
			</TooltipTrigger>
		);
	};

	const ContEnabled = () => {
		return (
			<Button
				variant="primary"
				style={{ justifyContent: "center", minWidth: "15%" }}
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
