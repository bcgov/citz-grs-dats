import { Button } from "@bcgov/design-system-react-components";
import { Box, Modal, Stack, TextareaAutosize, Typography } from "@mui/material";

type Props = {
  open: boolean;
  explanation: string;
  setExplanation: React.Dispatch<React.SetStateAction<string>>;
  onClose: () => void;
  onConfirm: () => void;
};

const innerButtonStyle = {
  justifyContent: "center",
  padding: "8px 16px",
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 550,
  bgcolor: "background.paper",
  border: "1px solid var(--modal-border)",
  borderRadius: "4px",
  boxShadow: "0px 25.6px 57.6px 0px #00000038, 0px 4.8px 14.4px 0px #0000002E",
};

const buttonBoxStyle = {
  display: "flex",
  justifyContent: "right",
  gap: 1,
  padding: "16px 24px",
  borderTop: "1px solid var(--modal-border)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "16px 24px",
  borderBottom: "1px solid var(--modal-border)",
};

const contentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  height: "fit-content",
  padding: "0 24px",
};

export const JustifyChangesModal = ({
  open,
  onClose,
  onConfirm,
  explanation,
  setExplanation,
}: Props) => {
  return (
    <Modal open={open} onClose={onClose} disableAutoFocus>
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <Typography variant="h3" sx={{ color: "var(--text) " }}>
            Explanation of changes
          </Typography>
        </Box>

        <Box sx={contentStyle}>
          <Typography>
            <b>
              Please explain why you updated and/or deleted one or more folder
              paths
            </b>{" "}
            (required)
          </Typography>
          <TextareaAutosize
            style={{
              padding: "8px 12px",
              border: "1px solid var(--modal-border)",
              fontFamily: "BC Sans",
              fontSize: "16px",
              lineHeight: "27px",
              borderRadius: "4px",
            }}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            minRows={5}
            placeholder={`• The folder name changed slightly during a LAN drive clean-up
• The folder location changed during a LAN drive clean-up
• The folder is active again due to an audit, FOI request, legal case, etc.`}
          />
        </Box>

        <Box sx={buttonBoxStyle}>
          <Button variant="tertiary" style={innerButtonStyle} onPress={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            style={innerButtonStyle}
            onPress={onConfirm}
            isDisabled={explanation === ""}
          >
            Next
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
};
