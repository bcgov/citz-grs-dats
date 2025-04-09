import { Button } from "@bcgov/design-system-react-components";
import { Box, Modal, Stack, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

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

const headerStyle = {
  display: "flex",
  flexDirection: "row",
  gap: 1,
  padding: "16px 24px",
  borderBottom: "1px solid var(--modal-border)",
};

const buttonBoxStyle = {
  display: "flex",
  justifyContent: "right",
  gap: 1,
  flexShrink: 0,
  borderTop: "1px solid var(--modal-border)",
  padding: 2,
};

const contentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  height: "fit-content",
  padding: "8px 24px",
};

export const CloseApplicationModal = ({ open, onClose, onConfirm }: Props) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      style={{ zIndex: "9999" }}
      disableAutoFocus
    >
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <WarningAmberIcon sx={{ color: "#F8BB47", width: "20px" }} />
          <Typography variant="h3" sx={{ color: "var(--text)" }}>
            Close application?
          </Typography>
        </Box>

        <Box sx={contentStyle}>
          <Typography>
            If you close the application,{" "}
            <b>any unsaved progress will be lost</b>. Are you sure you want to
            continue?
          </Typography>
        </Box>

        <Box sx={buttonBoxStyle}>
          <Button variant="tertiary" style={innerButtonStyle} onPress={onClose}>
            Keep working
          </Button>
          <Button
            variant="secondary"
            style={innerButtonStyle}
            onPress={onConfirm}
          >
            Confirm close
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
};
