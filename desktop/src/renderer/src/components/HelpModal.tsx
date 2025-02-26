import { Box, Link, Modal, Stack, Typography } from "@mui/material";
import { Close as XIcon } from "@mui/icons-material";

type Props = {
  open: boolean;
  onClose: () => void;
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
  marginBottom: "24px",
};

export const HelpModal = ({ open, onClose }: Props) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <Typography variant="h3">Help & resources</Typography>
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
            Need help? Selection from one of the options below.
          </Typography>

          <Stack gap={1}>
            <Typography variant="h4">Human support</Typography>
            <Link
              href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management/records-contacts"
              target="_blank"
            >
              Contact your GIM Specialists.
            </Link>
          </Stack>

          <Stack gap={1}>
            <Typography variant="h4">Self-guided support</Typography>
            <Typography>
              Check out the{" "}
              <Link
                href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/records-management"
                target="_blank"
              >
                BC Gov Records Management page
              </Link>{" "}
              and the{" "}
              <Link
                href="https://intranet.gov.bc.ca/thehub/ocio/cirmo/grs/grs-learning"
                target="_blank"
              >
                GIM Learning page.
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Modal>
  );
};
