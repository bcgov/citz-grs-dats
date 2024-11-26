import { Drawer, List, ListItem, Divider, Typography, useTheme, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
	HomeOutlined as HomeOutlinedIcon,
	DescriptionOutlined as FileListIcon,
	DriveFileMoveOutlined as SendRecordsIcon,
} from "@mui/icons-material";
import { type ReactNode, useState } from "react";
import { AuthButton } from "./AuthButton";

type NavItemProps = {
	path: string;
	label: string;
	icon: ReactNode;
};

type Props = {
	accessToken: string | undefined;
	idToken: string | undefined;
};

export const SideNav = ({ accessToken, idToken }: Props) => {
	const navigate = useNavigate();
	const theme = useTheme();
	const [currentPage, setCurrentPage] = useState("/");

	const handleSelection = (path: string) => {
		setCurrentPage(path);
		navigate(path);
	};

	const NavItem = ({ path, label, icon }: NavItemProps) => {
		const theme = useTheme();
		return (
			<ListItem
				sx={{
					gap: 1,
					border: "none",
					borderRadius: "5px",
					background:
						currentPage === path ? theme.palette.secondary.light : theme.palette.secondary.main,
					"&:hover": {
						background: theme.palette.secondary.dark,
					},
				}}
				component="button"
				onClick={() => handleSelection(path)}
			>
				<Typography sx={{ color: `${theme.palette.secondary.dark}` }}>{icon}</Typography>
				<Typography
					variant="h4"
					sx={{
						color: `${theme.palette.secondary}`,
					}}
				>
					{label}
				</Typography>
			</ListItem>
		);
	};

	return (
		<Drawer
			variant="permanent"
			anchor="left"
			sx={{
				flexShrink: 0,
				width: "15%",
				background: theme.palette.secondary.light,
				"& .MuiDrawer-paper": {
					width: "15%",
					flexShrink: 0,
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
					background: theme.palette.secondary.light,
				}}
			>
				<List>
					<NavItem path="/" label="Home" icon={<HomeOutlinedIcon />} />
					<Divider sx={{ margin: "5px 0" }} />
					{/* REQUIRE AUTH */}
					{accessToken && (
						<>
							<NavItem path="/file-list" label="Create File List" icon={<FileListIcon />} />
							<NavItem path="/send-records" label="Send Records" icon={<SendRecordsIcon />} />
						</>
					)}
				</List>
				<AuthButton accessToken={accessToken} idToken={idToken} />
			</Box>
		</Drawer>
	);
};
