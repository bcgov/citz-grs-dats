import React from 'react';
import Row from './DigitalFileRow';
import Grid from '@mui/material/Grid';

const DigitalFileGrid: React.FC = () => {
  return (
    <Grid>
      <Row>
        <div className="col-md-6">Column 1</div>
        <div className="col-md-6">Column 2</div>
      </Row>
      <Row>
        <div className="col-md-4">Column 1</div>
        <div className="col-md-4">Column 2</div>
        <div className="col-md-4">Column 3</div>
      </Row>
    </Grid>
  );
}

export default DigitalFileGrid;
