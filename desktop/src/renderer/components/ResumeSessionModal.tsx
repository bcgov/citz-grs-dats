import { Button } from "@bcgov/design-system-react-components";
import { RestartAlt as RestartIcon } from "@mui/icons-material";
import { Box, Modal, Stack, Typography } from "@mui/material";
import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  cachedFolders: MetadataCacheEntry[];
  isAuthenticated: boolean;
  onContinue: () => void;
  onStartFresh: () => void;
  onClose: () => void;
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
  width: 650,
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

export const ResumeSessionModal = ({
  open,
  cachedFolders,
  isAuthenticated,
  onContinue,
  onStartFresh,
  onClose,
}: Props) => {
  const wasAuthenticatedRef = useRef(isAuthenticated);

  // After login completes while modal is open, auto-continue
  useEffect(() => {
    if (open && !wasAuthenticatedRef.current && isAuthenticated) {
      wasAuthenticatedRef.current = true;
      onContinue();
    }
    if (!open) {
      wasAuthenticatedRef.current = isAuthenticated;
    }
  }, [open, isAuthenticated, onContinue]);

  return (
    <Modal open={open} onClose={onClose} disableAutoFocus>
      <Stack gap={3} sx={modalStyle}>
        <Box sx={headerStyle}>
          <Stack direction="row" spacing={1}>
            <RestartIcon sx={{ color: "var(--text)", width: "20px" }} />
            <Typography variant="h3" sx={{ color: "var(--text)" }}>
              Continue where you left off?
            </Typography>
          </Stack>
        </Box>

        <Box sx={contentStyle}>
          <Typography>
            We found saved progress for the following folder(s). Continue to
            pick up right where you left off, or start fresh to begin again.
          </Typography>
          <Box
            sx={{
              maxHeight: 240,
              overflowY: "auto",
              border: "1px solid var(--modal-border)",
              borderRadius: "4px",
            }}
          >
            {cachedFolders.map((folder) => (
              <Box
                key={folder.sourcePath}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--modal-border)",
                }}
              >
                <Typography sx={{ wordBreak: "break-all" }}>
                  {folder.sourcePath}
                </Typography>
                <Typography
                  sx={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}
                >
                  {folder.processedCount}/{folder.totalFileCount} files
                </Typography>
              </Box>
            ))}
          </Box>
          {!isAuthenticated && (
            <Typography sx={{ color: "var(--warning)" }}>
              You're logged out. Continuing will prompt you to log in, then you
              can resume where you left off.
            </Typography>
          )}
        </Box>

        <Box sx={buttonBoxStyle}>
          <Button variant="tertiary" style={innerButtonStyle} onPress={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            style={innerButtonStyle}
            onPress={onStartFresh}
          >
            Start fresh
          </Button>
          <Button
            variant="primary"
            style={innerButtonStyle}
            onPress={onContinue}
          >
            {isAuthenticated ? "Continue" : "Log in to continue"}
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
};
