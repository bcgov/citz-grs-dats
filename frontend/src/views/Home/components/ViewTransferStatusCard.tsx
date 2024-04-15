import React, { FC, ReactElement } from "react";
import ViewTransferStatusImage from "../assets/View-Transfer-Status.png";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material";

const ViewTransferStatusCard: FC = (): ReactElement => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLearnMoreClick = () => {
    // Navigate to the "Products" page when the "Learn More" button is clicked
    navigate("/ViewTransferStatus");
  };
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          View Transfer status
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Producer or Archivist can view and managed the information on PSPs
          processed and created by DATS in order to process the accession and
          create the SIP.
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
export default ViewTransferStatusCard;
