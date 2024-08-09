import React from "react";
import { Box, Typography } from "@mui/material";
import CardComponent from "../../components/Card/CardComponent";
import { useSSO } from "@bcgov/citz-imb-sso-react";

const Dashboard: React.FC = () => {
  const { hasRoles } = useSSO();
  return (
    <div style={{ marginBottom: "45px" }}>
      <Typography>
        The first time you use DATS you must install a desktop app from the
        Software Center. Please follow these instructions [insert link later].
      </Typography>
      <br />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CardComponent
          title="Create a Digital File List"
          content="Create a file list for digital government information stored in a LAN drive. Provide a Windows folder address and some basic information, and DATS will create a list of every document in that folder for you. "
          link="/create"
        />
        <CardComponent
          title="Send Record to DATS"
          content="Send digital Full Retention (FR) records to the Digital Archives, from either a LAN drive or EDRMS."
          link="/send"
        />
        {hasRoles(["Archivist"]) && (
          <CardComponent
            title="View Transfer status"
            content="Digital Archives staff can view and manage transfers sent via DATS, in order to create Pre-Submission Packages (PSPs). The source of truth for approvals and client service history continues to be ARIS."
            link="/transfer-status"
          />
        )}
      </Box>
      <br />
      <Typography>
        If you need assistance{" "}
        <a href="https://www2.gov.bc.ca/gov/content?id=FE683E9D3E3F4CD19AA03BF979D4EC23 ">
          contact your GIM Specialists
        </a>
        .
      </Typography>
    </div>
  );
};

export default Dashboard;
