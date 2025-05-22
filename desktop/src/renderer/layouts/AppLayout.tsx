import { useNavigate } from "@/renderer/hooks";
import { Header } from "@bcgov/design-system-react-components";
import { Button, Grid2 as Grid } from "@mui/material";
import { useNotification } from "@renderer/hooks";
import { SideNav } from "../components/SideNav";

export const AppLayout = ({ children }) => {
	const { navigate } = useNavigate();
	const { NotificationContainer } = useNotification();

	return (
		<Grid container sx={{ height: "100vh" }}>
			<Grid size={2}>
				<SideNav />
			</Grid>
			<Grid size={10}>
				<Header
					title="Digital Archives Transfer Service"
					logoLinkElement={<Button onClick={() => navigate("/")} />}
				/>
				{children}
				<NotificationContainer />
			</Grid>
		</Grid>
	);
};
