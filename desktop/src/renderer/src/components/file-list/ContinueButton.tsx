import {
  Button,
  Tooltip,
  TooltipTrigger,
} from "@bcgov/design-system-react-components";

export const ContinueButton = ({ onClick, isEnabled }): JSX.Element => {
  const ContDisabled = () => {
    return (
      <TooltipTrigger delay={0}>
        <Button
          className="disabled-button"
          variant="primary"
          size="small"
          style={{ minWidth: "12%", fontSize: "16px" }}
          preventFocusOnPress={true}
        >
          Continue
        </Button>
        <Tooltip placement="bottom">
          Ensure folders are selected, loading is complete, and you are logged
          in before continuing.
        </Tooltip>
      </TooltipTrigger>
    );
  };

  const ContEnabled = () => {
    return (
      <Button
        variant="primary"
        style={{ justifyContent: "center", minWidth: "12%", fontSize: "0.9em" }}
        onPress={onClick}
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
