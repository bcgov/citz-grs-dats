import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { styled } from "@mui/material/styles";
import {
  Card,
  Typography,
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemAvatar,
  Avatar,
  Paper,
  Theme,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import UploadService from "../../../services/uploadService";
import checkMark from "../../../assets/images/Sign-check-icon.png";

const useStyles = makeStyles((theme: Theme) => ({
    container: {
      display: "flex",
      flexWrap: "nowrap",
      "& > :not(style)": {
        m: 1,
        width: "80%",
        height: "auto",
      },
    },
    folderList: {
      marginTop: theme.spacing(2),
      maxHeight: "auto",
      overflowY: "auto",
    },
    infoBox: {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(2),
      height: "80%",
      padding: theme.spacing(2),
    },
  })
);

interface FoldersValidationProps {
  onValidation?: () => void;
}

const FoldersValidation: React.FC<FoldersValidationProps> = ({}) => {
  const [folders] = useState<string[]>([]);
  const classes = useStyles();
  const uploadService = new UploadService();
  const handleValidation = () => {

    console.log("Validating folders");
  };
  return (
    <Card>
      <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
        List of Validated Folders
      </Typography>
      <Grid container spacing={2} direction="row" sx={{ marginBottom: 4 }}>
        <Grid item xs={12}>
          <Box className={classes.container}>
            <Box className={classes.folderList}>
              <List>
                {folders.map((folder, index) => (
                  <ListItem
                    style={{ height: "40px" }}
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete">
                        <img
                          src={checkMark}
                          alt="Check Mark"
                          style={{ width: 24, height: 24 }}
                        />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <FolderIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={folder} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Grid item xs={3}>
              <Paper elevation={4} className={classes.infoBox}>
                <Typography variant="body2">
                  Additional information goes here...
                </Typography>
              </Paper>
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12}>
          {/* Add any additional buttons or actions related to folder validation */}
          <Button variant="contained" color="primary" onClick={handleValidation}>
            Validate Folders
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default FoldersValidation;
