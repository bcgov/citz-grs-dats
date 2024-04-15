import React, { FC, ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material";

const SendRecordsCard: FC = (): ReactElement => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLearnMoreClick = () => {
    // Navigate to the "Products" page when the "Learn More" button is clicked
    navigate("/SendRecords");
  };
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Send Record to DATS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Producer can create a Digital File list from a windows folder. The
          result will be a Excel sheets base on the Digital file list teamplate
          from GRS
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleLearnMoreClick}>
          Start
        </Button>
      </CardActions>
    </Card>
  );
};
export default SendRecordsCard;
