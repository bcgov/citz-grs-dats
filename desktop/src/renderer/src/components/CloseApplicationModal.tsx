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
  width: "25%",
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

const headerStyle = {
  display: "flex",
  flexDirection: "row",
  gap: 2,
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
    <Modal open={open} onClose={onClose}>
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <WarningAmberIcon sx={{ color: "#F8BB47", width: "20px" }} />
          <Typography variant="h3">Close application?</Typography>
        </Box>

        <Box sx={contentStyle}>
          <Typography>
            If you close the application,{" "}
            <b>any unsaved progress will be lost</b>. Are you sure you want to
            continue?
          </Typography>
        </Box>

        <Box sx={buttonBoxStyle}>
          <Button variant="primary" style={innerButtonStyle} onPress={onClose}>
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
