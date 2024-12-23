import { Button } from "@bcgov/design-system-react-components";
import { Box, Typography } from "@mui/material";
import { useState } from "react";

type Props = {
	accessToken: string | undefined;
	idToken: string | undefined;
};

export const AuthButton = ({ accessToken, idToken }: Props): JSX.Element => {
	const [sso] = useState(window.api.sso); // Preload scripts

	const handleLogin = async () => await sso.startLoginProcess();
	const handleLogout = async () => await sso.logout(idToken);

	const user = sso.getUser(accessToken);

	return (
		<Box>
			{user && <Typography sx={{ marginBottom: 1 }}>{user.display_name}</Typography>}
			<Button
				variant="primary"
				style={{ justifyContent: "center", width: "100%" }}
				onPress={accessToken ? handleLogout : handleLogin}
			>
				{accessToken ? "Logout" : "Login"}
			</Button>
		</Box>
	);
};
