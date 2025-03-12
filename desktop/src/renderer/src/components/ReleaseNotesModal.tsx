import { Box, Modal, Stack, Typography } from "@mui/material";
import { Close as XIcon } from "@mui/icons-material";

type Props = {
  open: boolean;
  onClose: () => void;
  releaseNotes: Record<string, string> | null;
  appVersion: string | null;
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
  padding: "0 24px",
  marginBottom: "24px",
};

export const ReleaseNotesModal = ({
  open,
  onClose,
  releaseNotes,
  appVersion,
}: Props) => {
  if (
    !releaseNotes ||
    !appVersion ||
    releaseNotes.viewedReleaseVersion === appVersion
  )
    return null;
  const currentReleaseNotes = releaseNotes[appVersion].split(",");

  return (
    <Modal open={open} onClose={onClose}>
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <Typography variant="h3">What's New</Typography>
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
            Welcome back! Heres what's new in version <b>{appVersion}</b>.
          </Typography>

          <ul>
            {currentReleaseNotes.map((note, index) => {
              return <li key={`${index}-${note}`}>{note}</li>;
            })}
          </ul>
        </Box>
      </Stack>
    </Modal>
  );
};
