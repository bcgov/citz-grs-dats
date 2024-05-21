import React from 'react';
import { Card as MuiCard, CardContent, CardActions, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface CardProps {
  title: string;
  content: string;
  buttonText: string;
  link: string;
}

const CardComponent: React.FC<CardProps> = ({ title, content, buttonText, link }) => {
  return (
    <MuiCard sx={{ maxWidth: 345, margin: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={link}>
          {buttonText}
        </Button>
      </CardActions>
    </MuiCard>
  );
};

export default CardComponent;
