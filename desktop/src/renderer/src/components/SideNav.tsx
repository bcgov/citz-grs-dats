import {
  Drawer,
  List,
  ListItem,
  Divider,
  Typography,
  useTheme,
  Box,
} from "@mui/material";
import {
  HomeOutlined as HomeOutlinedIcon,
  DescriptionOutlined as FileListIcon,
  DriveFileMoveOutlined as SendRecordsIcon,
} from "@mui/icons-material";
import { type ReactNode, useState } from "react";
import { AuthButton } from "./AuthButton";
import { LeavePageModal } from "./LeavePageModal";

type NavItemProps = {
  path: string;
  label: string;
  icon: ReactNode;
};

type Props = {
  accessToken: string | undefined;
  idToken: string | undefined;
  currentPath: string;
  setCurrentPath: React.Dispatch<React.SetStateAction<string>>;
  progressMade: boolean;
};

export const SideNav = ({
  accessToken,
  idToken,
  currentPath,
  setCurrentPath,
  progressMade,
}: Props) => {
  const [leavePageModalOpen, setLeavePageModalOpen] = useState(false);
  const [newPagePath, setNewPagePath] = useState("/");

  const onConfirmLeavePage = () => {
    setLeavePageModalOpen(false);
    setCurrentPath(newPagePath);
  };

  const handleSelection = (path: string) => {
    // Ignore if path is the currentpath or a sub path.
    if (currentPath === path || (currentPath.startsWith(path) && path !== "/"))
      return;
    if (progressMade && currentPath !== "/") {
      // Progress has been made, display leave page modal.
      setNewPagePath(path);
      setLeavePageModalOpen(true);
    } else {
      // Progress has not been made, navigate to path.
      setCurrentPath(path);
    }
  };

  const NavItem = ({ path, label, icon }: NavItemProps) => {
    const theme = useTheme();
    return (
      <ListItem
        sx={{
          gap: 1,
          border:
            currentPath === path ||
            (currentPath.startsWith(path) && path !== "/")
              ? "2px solid var(--sidenav-item-border-current-page)"
              : "2px solid transparent",
          borderRadius: "5px",
          background:
            currentPath === path ||
            (currentPath.startsWith(path) && path !== "/")
              ? theme.palette.secondary.light
              : "none",
          "&:hover": {
            background: theme.palette.secondary.dark,
          },
        }}
        component="button"
        onClick={() => handleSelection(path)}
      >
        {icon}
        <Typography>{label}</Typography>
      </ListItem>
    );
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          height: "100%",
          maxHeight: "100vh",
          "& .MuiDrawer-paper": {
            position: "fixed",
            width: "17%",
            boxSizing: "border-box",
            padding: 1,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <NavItem
              path="/"
              label="Home"
              icon={<HomeOutlinedIcon sx={{ color: "var(--sidenav-icon)" }} />}
            />
            <Divider sx={{ margin: "5px 0" }} />
            {/* REQUIRE AUTH */}
            {accessToken && (
              <>
                <NavItem
                  path="/file-list/instructions"
                  label="Create file list"
                  icon={<FileListIcon sx={{ color: "var(--sidenav-icon)" }} />}
                />
                <NavItem
                  path="/send-records"
                  label="Send records"
                  icon={
                    <SendRecordsIcon sx={{ color: "var(--sidenav-icon)" }} />
                  }
                />
              </>
            )}
          </List>
          <AuthButton accessToken={accessToken} idToken={idToken} />
        </Box>
      </Drawer>
      <LeavePageModal
        open={leavePageModalOpen}
        onClose={() => setLeavePageModalOpen(false)}
        onConfirm={onConfirmLeavePage}
      />
    </>
  );
};
