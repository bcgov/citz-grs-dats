import React from "react";
import { Box, Typography } from "@mui/material";
import { Button } from "@bcgov/design-system-react-components";
import { useNavigate } from "react-router-dom";

const CreateDigitalFileListSplash: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Typography sx={{ fontSize: "1.1em", fontWeight: "700" }}>
        Create Digital File List for LAN Drives
      </Typography>
      <br />
      <Typography>
        Before you begin this process, you should know which Full Retention (FR)
        digital records you intend to transfer to the Digital Archives. They
        should be covered by an{" "}
        <a href="https://www2.gov.bc.ca/gov/content?id=0607E3345FAE42DBB28C793CEB062E2C">
          approved Information Schedule
        </a>
        . All records should also be past their Final Disposition (FD), and not
        be part of an active audit or legal case.
      </Typography>
      <br />
      <Typography>
        If in doubt please{" "}
        <a href="https://www2.gov.bc.ca/gov/content?id=FE683E9D3E3F4CD19AA03BF979D4EC23 ">
          contact your GIM Specialists
        </a>{" "}
        for advice on the application of Information Schedules to your records.
      </Typography>
      <br />
      <Typography>
        Please note the process takes considerable time. If you have a large
        transfer (e.g. 5 GB), schedule your work to let DATS run for 3 hours. We
        are working on making the service faster in future versions of DATS.
      </Typography>
      <br />
      <Button
        variant="link"
        onPress={() => navigate("/create")}
        style={{ padding: 0 }}
      >
        Start
      </Button>
    </Box>
  );
};

export default CreateDigitalFileListSplash;
