import { useState } from "react";

type Props = {
	accessToken: string | undefined;
	idToken: string | undefined;
};

export const AuthButton = ({ accessToken, idToken }: Props): JSX.Element => {
	const [sso] = useState(window.api.sso); // Preload scripts

	const handleLogin = async () => await sso.startLoginProcess();
	const handleLogout = async () => await sso.logout(idToken);

	return (
		<button type="button" onClick={accessToken ? handleLogout : handleLogin}>
			{accessToken ? "Logout" : "Login"}
		</button>
	);
};
