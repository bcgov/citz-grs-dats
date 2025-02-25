import { Button } from "@bcgov/design-system-react-components";
import { Box, Modal, Stack, Typography } from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  setCurrentPath:
    | React.Dispatch<React.SetStateAction<string>>
    | ((value: string) => void);
};

const innerButtonStyle = {
  justifyContent: "center",
  width: "fit-content",
  height: "10%",
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 650,
  bgcolor: "background.paper",
  border: "1px solid var(--modal-border)",
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
  gap: 2,
  height: "fit-content",
  padding: "8px 24px",
};

export const ReturnToHomeModal = ({ open, onClose, setCurrentPath }: Props) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <Typography variant="h3">Generating File List</Typography>
        </Box>

        <Box sx={contentStyle}>
          <Typography>
            Your file list is being processed. Once complete, it will be sent to
            you via email.
          </Typography>
          <Typography>
            Please refer to the email for next steps instructions.
          </Typography>
        </Box>

        <Box sx={buttonBoxStyle}>
          <Button
            variant="primary"
            style={innerButtonStyle}
            onPress={() => setCurrentPath("/")}
          >
            Return to Home
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
};
