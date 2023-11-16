import * as React from "react";
import { routes } from "../../routes";
import { Link } from "react-router-dom";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";

export const NavItems = (
  <React.Fragment>
    {routes.map((route) => (
      <ListItemButton key={route.key} component={Link} to={route.path}>
        <ListItemIcon>
          {route.key === "home-route" && <DashboardIcon />}
          {route.key === "about-route" && <ShoppingCartIcon />}
          {route.key === "products-route" && <PeopleIcon />}
        </ListItemIcon>
        <ListItemText primary={route.title} />
      </ListItemButton>
    ))}
  </React.Fragment>
);
