import React, { FC, ReactElement } from "react";
import PSPStructuredImage from "../assets/PSP-structure.png";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material";

const PSPStructuredCard: FC = (): ReactElement => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLearnMoreClick = () => {
    // Navigate to the "Products" page when the "Learn More" button is clicked
    navigate("/products");
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        alt="Send Records"
        height="140"
        image={PSPStructuredImage}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Create a structured PSP
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Producer can create a Digital File list from a windows folder. The
          result will be an Excel sheet based on the Digital file list template
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

export default PSPStructuredCard;
