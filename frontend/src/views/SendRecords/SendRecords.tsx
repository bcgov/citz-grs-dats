import React from 'react';
import { Container, Grid } from '@mui/material';
import CardComponent from '../../components/Card/CardComponent';

const SendRecords: React.FC = () => {
  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="Send Records from LAN Drive"
            content="Transfer approved records to the Digital Archives, from a LAN drive. "
            buttonText="Start"
            link="/send-lan"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="Send Record from EDRMS"
            content="Transfer approved records to the Digital Archive, from EDRMS."
            buttonText="Start"
            link="/send-edrms"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default SendRecords;
