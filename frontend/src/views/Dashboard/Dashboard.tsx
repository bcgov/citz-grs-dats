import React from "react";
import { Container, Grid } from "@mui/material";
import CardComponent from "../../components/Card/CardComponent";
import { useSSO } from "@bcgov/citz-imb-sso-react";

const Dashboard: React.FC = () => {
  const { hasRoles } = useSSO();
  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="Create a Digital File List"
            content="Create a file list for digital government information stored in a LAN drive. Provide a Windows folder address and some basic information, and DATS will create a list of every document in that folder for you. "
            buttonText="Start"
            link="/create"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="Send Record to DATS"
            content="Send digital Full Retention (FR) records to the Digital Archives, from either a LAN drive or EDRMS"
            buttonText="Start"
            link="/send"
          />
        </Grid>
        {hasRoles(["Archivist"]) && (
          <Grid item xs={12} sm={6} md={4}>
            <CardComponent
              title="View Transfer status"
              content="Digital Archives staff can view and manage transfers sent via DATS, in order to create Pre-Submission Packages (PSPs). The source of truth for approvals and client service history continues to be ARIS"
              buttonText="Start"
              link="/transfer-status"
            />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
