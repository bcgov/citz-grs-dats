import { useNavigate } from "@/hooks";
import { Header } from "@bcgov/design-system-react-components";
import { Button, Grid2 as Grid } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { SideNav } from "../components/SideNav";

export const AppLayout = ({ children }) => {
	const { navigate } = useNavigate();

	return (
		<Grid
			container
			sx={{ height: "100vh" }}
		>
			<Grid size={2}>
				<SideNav />
			</Grid>
			<Grid size={10}>
				<Header
					title="Digital Archives Transfer Service"
					logoLinkElement={<Button onClick={() => navigate("/")} />}
				/>
				{children}
				<ToastContainer
					position="bottom-left"
					autoClose={4000}
					hideProgressBar
					pauseOnHover
					stacked
				/>
			</Grid>
		</Grid>
	);
};
