import SelectFolder from "./components/SelectFolder";
import { Typography } from "@mui/material";

export default function CreateDigitalFileList() {
  return (
    <>
      <Typography sx={{ fontSize: "1.1em", fontWeight: "700" }}>
        Create Digital File List
      </Typography>
      <SelectFolder />
    </>
  );
}
