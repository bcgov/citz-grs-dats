import { Button } from "@bcgov/design-system-react-components";
import { Box, Modal, Stack, Typography } from "@mui/material";

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
  gap: 2,
  height: "fit-content",
  padding: "8px 24px",
};

export const DeclineSubAgreementModal = ({
  open,
  onClose,
  onConfirm,
}: Props) => {
  return (
    <Modal open={open} onClose={onClose} disableAutoFocus>
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <Typography variant="h3" sx={{ color: "var(--text)" }}>
            Decline Submission Agreement?
          </Typography>
        </Box>

        <Box sx={contentStyle}>
          <Typography>
            You must agree to the Submission Agreement in order to send records
            to the Digital Archives.
          </Typography>
          <Typography>
            If you decline the Submission Agreement, the current process will be
            cancelled, and you will be returned to the DATS homepage. An
            archivist will follow up with you to discuss your concerns. You can
            come back and start the process again when you are ready.
          </Typography>
        </Box>

        <Box sx={buttonBoxStyle}>
          <Button variant="primary" style={innerButtonStyle} onPress={onClose}>
            Back
          </Button>
          <Button
            variant="tertiary"
            style={innerButtonStyle}
            onPress={onConfirm}
          >
            Decline
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
};
