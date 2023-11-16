import React, { FC, ReactElement } from "react";
import DigitalFileListImage from "../assets/Digital-File-List.png";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material";

const CreateFileListCard: FC = (): ReactElement => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLearnMoreClick = () => {
    // Navigate to the "Products" page when the "Learn More" button is clicked
    navigate("/CreateDigitalFileList");
  };
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        alt="Digital-File-List"
        height="140"
        image={DigitalFileListImage}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Create a Digital File List
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
export default CreateFileListCard;
