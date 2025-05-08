import { Button } from "@bcgov/design-system-react-components";
import { Box, Modal, Stack, Typography } from "@mui/material";
import { Close as XIcon } from "@mui/icons-material";

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
  width: 500,
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
  alignItems: "center",
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

export const ConfirmDeletionModal = ({ open, onClose, onConfirm }: Props) => {
  return (
    <Modal open={open} onClose={onClose} disableAutoFocus>
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <Typography variant="h3" sx={{ color: "var(--text)" }}>
            Confirm deletion
          </Typography>
          <button
            type="button"
            style={{
              background: "transparent",
              border: "none",
              width: "fit-content",
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            <XIcon />
          </button>
        </Box>

        <Box sx={contentStyle}>
          <Typography>
            Are you sure you want to delete this transfer? This action cannot be
            undone.
          </Typography>
        </Box>

        <Box sx={buttonBoxStyle}>
          <Button variant="primary" style={innerButtonStyle} onPress={onClose}>
            Cancel
          </Button>
          <Button
            variant="tertiary"
            style={innerButtonStyle}
            onPress={onConfirm}
          >
            Delete
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
};
