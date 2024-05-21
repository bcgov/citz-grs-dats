import React from 'react';
import { Container, Grid } from '@mui/material';
import CardComponent from '../../components/Card/CardComponent';

const Dashboard: React.FC = () => {
  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="Create a Digital File List"
            content="Producer can create a Digital File list from a windows folder. The result will be a Excel sheets base on the Digital file list teamplate from GRS"
            buttonText="Start"
            link="/create"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="Send Record to DATS"
            content="Producer can create a Digital File list from a windows folder. The result will be a Excel sheets base on the Digital file list teamplate from GRS"
            buttonText="Start"
            link="/send"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="View Transfer status"
            content="Archivist can view and managed the information on PSPs processed and created by DATS in order to process the accession and create the SIP."
            buttonText="Start"
            link="/transfer-status"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="Title"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
            buttonText="Start"
            link="/route4"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
