//@ts-ignore
import { Typography, Box, Drawer, useTheme, type SxProps } from "@mui/material";

export const FileListPage = () => {
	const theme = useTheme();
	return (
		<Drawer
			variant="permanent"
			anchor="right"
			sx={{
				width: "80%", // sets width of main view area
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: "80%",
					flexShrink: 0,
					boxSizing: "border-box",
					padding: 1,
					background: `${theme.palette.primary}`,
				},
			}}
		>
			<Typography>File List</Typography>
			<button type="button">Add Folder(s)</button>
		</Drawer>
	);
};
