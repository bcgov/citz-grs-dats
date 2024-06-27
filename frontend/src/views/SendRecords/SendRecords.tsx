import React from 'react';
import { Container, Grid } from '@mui/material';
import CardComponent from '../../components/Card/CardComponent';

const SendRecords: React.FC = () => {
  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="Send Records to DATS"
            content="Transfer Digital FR Records from a lan drive ( Windows ) "
            buttonText="Start"
            link="/send-lan"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CardComponent
            title="Send Record to DATS"
            content="Transfer Digital FR Records from EDRMS"
            buttonText="Start"
            link="/send-edrms"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default SendRecords;
