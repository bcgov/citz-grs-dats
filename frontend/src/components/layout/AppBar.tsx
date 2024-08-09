import React, { useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Menu, MenuItem, Stack } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSSO } from "@bcgov/citz-imb-sso-react";
import { useLocation } from "react-router-dom";
import HealthCheck from "../HealthCheck";
// Create styles
const useStyles = makeStyles((theme) => ({
  logo: {
    marginRight: "16px",
    height: "50px",
  },
}));
const MyAppBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [breadcrumbs, setBreadcrumbs] = React.useState<string>("");
  const classes = useStyles();
  const location = useLocation();
  const { isAuthenticated, login, logout, user } = useSSO();
  const titleMapping: { [key: string]: string } = {
    create: "Create Digital File List",
    send: "Send Record to DATS",
    "transfer-status": "View Transfer status",
    "send-edrms": "Send Records from EDRMS ",
    "send-lan": "Send Records from LAN Drive",
  };

  useEffect(() => {
    const pathParts = location.pathname.split("/").filter((part) => part); // Filter to remove empty parts

    // Map the parts to their respective titles
    const mappedTitles = pathParts.map((part) => titleMapping[part] || "");

    // Join the mapped titles to form the final document title if there are any
    if (mappedTitles.length > 0) {
      // Join the mapped titles with a hyphen separator to create a single string
      const documentTitle = mappedTitles.join(" / ");
      // Update the state with the new document title
      setBreadcrumbs(documentTitle);
      // Set the document title
      document.title = documentTitle;
    } else {
      // If no valid mappings, clear the document title
      setBreadcrumbs("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <AppBar position="static" sx={{ mb: 5 }}>
      <HealthCheck />
      <Toolbar>
        <img
          src="/assets/BCID_H_rgb_rev.e68ccb04.png"
          alt="Logo"
          className={classes.logo}
        />
        {isAuthenticated ? (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => {
              window.location.href = `/dashboard`;
            }}
          >
            <HomeIcon />
          </IconButton>
        ) : null}
        {isAuthenticated && breadcrumbs ? (
          <Typography sx={{ color: "white" }}> / {breadcrumbs}</Typography>
        ) : null}
        <Stack direction="row" sx={{ flexGrow: 1 }}>
          <Typography
            variant="h3"
            component="div"
            sx={{ marginBottom: "15px", color: "white", marginLeft: "20px" }}
          >
            Digital Archives Transfer Service (DATS)
          </Typography>
          <Typography
            sx={{
              color: "#FCBA19",
              fontWeight: "700",
              fontSize: "0.8em",
              marginTop: "15px",
              marginLeft: "5px",
            }}
          >
            PILOT
          </Typography>
        </Stack>
        {isAuthenticated ? (
          <div>
            <IconButton
              color="inherit"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>{user?.name}</MenuItem>
              <MenuItem onClick={() => logout()}>Logout</MenuItem>
            </Menu>
          </div>
        ) : (
          <Button
            color="inherit"
            onClick={() =>
              login({ idpHint: "idir", postLoginRedirectURL: "/dashboard" })
            }
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default MyAppBar;
