import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import {
  Card,
  Divider,
  Typography,
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import UploadService from "../../../services/uploadService";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropzone: {
      marginTop: theme.spacing(2),
      border: "3px dashed #513dd4",
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(2),
      textAlign: "center",
      cursor: "pointer",
    },
    uploadButton: {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(2),
    },
    fileList: {
      marginTop: theme.spacing(2),
      maxHeight: "150px",
      overflowY: "auto",
    },
    container: {
      display: "flex",
      flexWrap: "nowrap",
      "& > :not(style)": {
        m: 1,
        width: 650,
        height: 250,
      },
    },
  })
);

interface Aris66xDropZoneProps {
  onFileChange?: (file: File) => void;
  onUpload?: () => void;
}

const Aris66xDropZone: React.FC<Aris66xDropZoneProps> = ({
  onFileChange,
  onUpload,
}) => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadService = new UploadService();

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Only accept the first file if multiple are dropped
      const file = acceptedFiles[0];
      setSelectedFile(file);

      // If an external callback is provided, call it
      if (onFileChange) {
        onFileChange(file);
      }
    },
    [onFileChange]
  );

  const handleUpload = useCallback(() => {
    // No need to check if selectedFile is truthy here
    const formData = new FormData();
    formData.append("uploadARIS66xfile", selectedFile!); // Asserting non-null here

    // Assuming uploadService.upload66xFile returns a Promise
    uploadService
      .upload66xFile(formData)
      .then((response) => {
        console.log(response);
        if (onUpload) {
          onUpload();
        }
      })
      .catch((error) => {
        console.error("Upload error:", error);
      });
  }, [onUpload, selectedFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: false,
  });

  return (
    <Card>
      <Box p={3}>
        <Typography variant="subtitle2">
          Select a file from your computer or drop it here to upload.
        </Typography>
      </Box>
      <Divider />

      <Grid container spacing={2} direction="row" sx={{ marginBottom: 4 }}>
        <Grid item xs={12}>
          <Box className={classes.container}>
            <Paper elevation={1}>
              <Grid item xs={9}>
                <div
                  {...getRootProps()}
                  className={`${classes.dropzone} ${
                    isDragActive ? "active" : ""
                  }`}
                >
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop a file here, or click to select a file</p>
                </div>
                <Button
                  className={classes.uploadButton}
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                >
                  Upload
                </Button>
              </Grid>
            </Paper>
            <Grid item xs={3}>
              <Paper elevation={4}>Informations</Paper>
            </Grid>
          </Box>
        </Grid>
        {selectedFile && (
          <List className={classes.fileList}>
            <ListItem>
              <ListItemText primary={selectedFile.name} />
            </ListItem>
          </List>
        )}
      </Grid>
    </Card>
  );
};

export default Aris66xDropZone;
