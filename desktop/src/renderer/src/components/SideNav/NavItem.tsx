import { useAuth, useNavigate } from "@/hooks";
import { ListItem, Typography, useTheme } from "@mui/material";
import type { NavItemProps } from "./NavItem.d";

export const NavItem = ({ path, label, icon, role }: NavItemProps) => {
	const theme = useTheme();
	const { location, navigate } = useNavigate();
	const { accessToken, hasRole } = useAuth();

	let sx = {
		gap: 1,
		border: "2px solid transparent",
		borderRadius: "5px",
		background: "none",
		"&:hover": {
			background: theme.palette.secondary.dark,
		},
	};

	// Highlight the current page
	if (
		location.pathname === path ||
		(path !== "/" && location.pathname.startsWith(path))
	) {
		sx = {
			...sx,
			border: "2px solid var(--sidenav-item-border-current-page)",
			background: theme.palette.secondary.light,
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
