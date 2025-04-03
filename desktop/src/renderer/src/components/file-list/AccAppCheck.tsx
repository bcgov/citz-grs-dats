import { Radio, RadioGroup } from "@bcgov/design-system-react-components";
import { Stack, Typography } from "@mui/material";

type Props = {
  hasAccApp: boolean | null;
  setHasAccApp: React.Dispatch<React.SetStateAction<boolean | null>>;
  enabled: boolean;
};

export const AccAppCheck = ({ hasAccApp, setHasAccApp, enabled }: Props) => {
  const textStyles = {
    fontSize: "16px",
    color: enabled ? "var(--text)" : "var(--text-disabled)",
  };

  return (
    <Stack
      gap={1}
      sx={{
        padding: "8px 16px",
        backgroundColor: "var(--acc-app-confirmation-bg)",
      }}
    >
      <Typography sx={textStyles}>
        <b>Do you have an Accession and Application number for this list?</b>{" "}
        (required)
      </Typography>
      <RadioGroup
        value={hasAccApp ? "Yes" : hasAccApp === false ? "No" : null}
        onChange={(value) => setHasAccApp(value === "Yes")}
        name="acc-app-check-radio-group"
      >
        <Radio value="Yes" style={textStyles}>
          Yes
        </Radio>
        <Radio value="No" style={textStyles}>
          No
        </Radio>
      </RadioGroup>
    </Stack>
  );
};
