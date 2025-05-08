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
  padding: "8px 16px",
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
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
  padding: "8px 24px",
};

export const LoginRequiredModal = ({ open, onClose, onConfirm }: Props) => {
  return (
    <Modal open={open} onClose={onClose} disableAutoFocus>
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <Stack direction="row" spacing={1}>
            <WarningIcon sx={{ color: "var(--warning)", width: "20px" }} />
            <Typography variant="h3" sx={{ color: "var(--text)" }}>
              You're logged out
            </Typography>
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
