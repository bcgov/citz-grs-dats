import { Button } from "@bcgov/design-system-react-components";
import { Box, Typography } from "@mui/material";
import { useAuth } from "@renderer/hooks";

export const AuthButton = (): JSX.Element => {
	const { accessToken, login, logout, user } = useAuth();

	return (
		<Box sx={{ marginBottom: 2 }}>
			{user && (
				<Typography sx={{ paddingLeft: 2, paddingBottom: 1 }}>{user.display_name}</Typography>
			)}
			<Button
				variant={accessToken ? "link" : "primary"}
				style={{
					width: "100%",
					justifyContent: accessToken ? "left" : "center",
				}}
				onPress={accessToken ? logout : login}
			>
				{accessToken ? "Logout" : "Login"}
			</Button>
		</Box>
	);
};
