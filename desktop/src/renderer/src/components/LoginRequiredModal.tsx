import { Button } from "@bcgov/design-system-react-components";
import { Box, Modal, Stack, Typography } from "@mui/material";
import { WarningAmber as WarningIcon } from "@mui/icons-material";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  width: 600,
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
  gap: 3,
  height: "fit-content",
  padding: "8px 24px",
};

export const LoginRequiredModal = ({ open, onClose, onConfirm }: Props) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <Stack direction="row" spacing={1}>
            <WarningIcon sx={{ color: "var(--warning)", width: "20px" }} />
            <Typography variant="h3">You're logged out</Typography>
          </Stack>
        </Box>

        <Box sx={contentStyle}>
          <Typography>Please login again to continue.</Typography>
          <Typography>
            Don’t worry, your progress has been saved, and you can pick up right
            where you left off after logging in.
          </Typography>
        </Box>

        <Box sx={buttonBoxStyle}>
          <Button variant="tertiary" style={innerButtonStyle} onPress={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            style={innerButtonStyle}
            onPress={onConfirm}
          >
            Login
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
};
