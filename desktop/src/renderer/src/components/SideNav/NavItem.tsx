import { useAuth, useNavigate } from "@/hooks";
import { ListItem, Typography, useTheme } from "@mui/material";
import type { NavItemProps } from "./NavItem.d";

export const NavItem = ({ path, label, icon, role }: NavItemProps) => {
  const theme = useTheme();
  const { location, navigate } = useNavigate();
  const { accessToken, hasRole } = useAuth();

  let sx = {
    gap: 1,
    marginTop: path === "/" ? 0 : "8px",
    padding: "8px 16px",
    borderRadius: "4px",
    border: "none",
    background: "none",
    "&:hover": {
      background: theme.palette.secondary.dark,
    },
  };

  if (
    path === "/" ? location.pathname === "/" : location.pathname.includes(path)
  ) {
    sx = {
      ...sx,
      background: "#F1F8FE",
    };
  }

	const listItem = (
		<ListItem
			sx={sx}
			component="button"
			onClick={() => navigate(path)}
		>
			{icon}
			<Typography>{label}</Typography>
		</ListItem>
	);

	if (!role) return listItem;
	if (accessToken && role === "any") return listItem;
	if (accessToken && hasRole(role)) return listItem;
	return null;
};
