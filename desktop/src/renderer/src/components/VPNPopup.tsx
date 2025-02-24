import { Box, Modal, Stack, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

type Props = {
  open: boolean;
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

const contentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  height: "fit-content",
  padding: "8px 24px",
  marginBottom: "16px",
};

export const VPNPopup = ({ open }: Props) => {
  return (
    <Modal open={open}>
      <Stack gap={2} sx={modalStyle}>
        <Box sx={headerStyle}>
          <WarningAmberIcon sx={{ color: "#F8BB47", width: "20px" }} />
          <Typography variant="h3">No Network or VPN Connection</Typography>
        </Box>

        <Box sx={contentStyle}>
          <Typography>
            Currently, you are not connected to the BC Gov network or the VPN.
            Please connect to the network or ensure your VPN is on to continue
            working in DATS.
          </Typography>
          <Typography>Need help with VPN? Call 77000.</Typography>
          <Typography sx={{ fontStyle: "italic", color: "#474543" }}>
            This pop up will disappear automatically once connection is
            established.
          </Typography>
        </Box>
      </Stack>
    </Modal>
  );
};
