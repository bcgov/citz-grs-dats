import { Drawer, List, ListItem, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
	HomeOutlined as HomeOutlinedIcon,
	DescriptionOutlined as FileListIcon,
	DriveFileMoveOutlined as SendRecordsIcon,
} from "@mui/icons-material";
import { type ReactNode, useState } from "react";

type NavItemProps = {
	path: string;
	label: string;
	icon: ReactNode;
};

export const SideNav: React.FC = () => {
	const navigate = useNavigate();
	const [currentPage, setCurrentPage] = useState("/");

	const handleSelection = (path: string) => {
		setCurrentPage(path);
		navigate(path);
	};

	const NavItem = ({ path, label, icon }: NavItemProps) => {
		return (
			<ListItem
				sx={{
					gap: 1,
					border: "none",
					borderRadius: "5px",
					background: currentPage === path ? "#ececec" : "#f9f9f9",
					"&:hover": {
						background: "#ececec",
					},
				}}
				component="button"
				onClick={() => handleSelection(path)}
			>
				{icon}
				<Typography sx={{ fontWeight: 600, fontSize: "1em", color: "#6e6e6e" }}>{label}</Typography>
			</ListItem>
		);
	};

	return (
		<Drawer
			variant="permanent"
			anchor="left"
			sx={{
				width: 240,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: 240,
					boxSizing: "border-box",
					padding: 1,
					background: "#f9f9f9",
				},
			}}
		>
			<List>
				<NavItem path="/" label="Home" icon={<HomeOutlinedIcon sx={{ color: "#6e6e6e" }} />} />
				<Divider sx={{ margin: "5px 0" }} />
				<NavItem
					path="/file-list"
					label="Create File List"
					icon={<FileListIcon sx={{ color: "#6e6e6e" }} />}
				/>
				<NavItem
					path="/send-records"
					label="Send Records"
					icon={<SendRecordsIcon sx={{ color: "#6e6e6e" }} />}
				/>
			</List>
		</Drawer>
	);
};
