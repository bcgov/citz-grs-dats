import { HelpOutline as HelpIcon } from "@mui/icons-material";
import { Box, Divider, Drawer, List, Stack, Typography } from "@mui/material";
import { AuthButton, HelpModal } from "@renderer/components";
import { useState } from "react";
import { NavItem } from "./NavItem";
import type { NavItemProps } from "./NavItem.d";
import navItemData from "./navItemData";
import { HomeOutlined as HomeOutlinedIcon } from "@mui/icons-material";

export const SideNav = () => {
  const [helpModalOpen, setHelpModalOpen] = useState(false);

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
              icon={
                <HomeOutlinedIcon sx={{ color: "var(--text-secondary)" }} />
              }
            />
            <hr
              style={{
                borderColor: "#D8D8D8",
                borderTop: "none",
              }}
            />
            {navItemData.map((item: NavItemProps) => (
              <NavItem key={item.label} {...item} />
            ))}
          </List>
          <Stack gap={2}>
            <button
              type="button"
              style={{
                background: "transparent",
                border: "none",
                width: "fit-content",
                cursor: "pointer",
              }}
              onClick={() => setHelpModalOpen(!helpModalOpen)}
            >
              <Stack direction="row" gap={1}>
                <HelpIcon />
                <Typography>Help</Typography>
              </Stack>
            </button>
            <Divider />
            <AuthButton />
          </Stack>
        </Box>
      </Drawer>
      <HelpModal open={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </>
  );
};
