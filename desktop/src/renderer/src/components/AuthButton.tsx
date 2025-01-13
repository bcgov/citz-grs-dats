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
    <Box sx={{ marginBottom: 2 }}>
      {user && (
        <Typography sx={{ paddingLeft: 2, paddingBottom: 1 }}>
          {user.display_name}
        </Typography>
      )}
      <Button
        variant={accessToken ? "link" : "primary"}
        style={{
          width: "100%",
          justifyContent: accessToken ? "left" : "center",
        }}
        onPress={accessToken ? handleLogout : handleLogin}
      >
        {accessToken ? "Logout" : "Login"}
      </Button>
    </Box>
  );
};
