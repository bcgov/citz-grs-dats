import "./CardComponent.css";
import React from "react";
import { Card as MuiCard, CardContent, Typography } from "@mui/material";

interface CardProps {
  title: string;
  content: string;
  link: string;
}

const CardComponent: React.FC<CardProps> = ({ title, content, link }) => {
  return (
    <MuiCard sx={{ maxWidth: 345, margin: 2 }} className="card">
      <a href={link} className="card-link">
        <CardContent sx={{ textAlign: "justify" }}>
          <Typography variant="h5" component="div">
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minHeight: 130 }}
          >
            {content}
          </Typography>
        </CardContent>
      </a>
    </MuiCard>
  );
};

export default CardComponent;
