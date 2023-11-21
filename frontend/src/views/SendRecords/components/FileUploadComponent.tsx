import React, { useState } from "react";
import {
  Card,
  Divider,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
} from "@mui/material";

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

      // Make an API call to upload the files using a service or fetch
      // Example: You might use the Fetch API or an Axios instance
      // fetch("your-upload-api-endpoint", {
      //   method: "POST",
      //   body: formData,
      // })
      // .then(response => response.json())
      // .then(data => console.log(data))
      // .catch(error => console.error("Upload error:", error));

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
