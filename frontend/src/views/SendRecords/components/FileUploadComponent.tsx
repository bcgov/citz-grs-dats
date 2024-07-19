import React, { useState } from "react";
import UploadService from "../../../services/uploadService";
import { Card, Divider, Typography, Box, Button, Grid } from "@mui/material";

const FileUploadComponent: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files);
    }
  };

  const handleUpload = () => {
    // Perform file upload logic here
    if (selectedFiles) {
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }

      // Clear the selected files after uploading
      setSelectedFiles(null);
    }
  };

  return (
    <Card>
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          File Upload
        </Typography>
        <Typography variant="subtitle2">
          Select a folder or files to upload.
        </Typography>
      </Box>
      <Divider />
      <Grid container spacing={4} direction="row" sx={{ marginBottom: 4 }}>
        <Grid item xs={12}>
          <input type="file" onChange={handleFileChange} multiple />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleUpload}>
            Upload
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default FileUploadComponent;
