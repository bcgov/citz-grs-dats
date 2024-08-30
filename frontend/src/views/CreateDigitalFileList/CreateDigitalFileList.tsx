import { useEffect } from "react";
import SelectFolder from "./components/SelectFolder";
import { Typography } from "@mui/material";
import { useSSO } from "@bcgov/citz-imb-sso-react";

export default function CreateDigitalFileList() {
  // const { isAuthenticated } = useSSO();

  // useEffect(() => {
  //   if (!isAuthenticated) window.location.href = "/";
  // }, [isAuthenticated]);
  return (
    <>
      <Typography sx={{ fontSize: "1.1em", fontWeight: "700" }}>
        Create Digital File List
      </Typography>
      <SelectFolder />
    </>
  );
}
