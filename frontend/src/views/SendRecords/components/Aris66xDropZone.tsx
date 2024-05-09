import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { makeStyles } from "@mui/styles";
import {
  Card,
  Divider,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Theme,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ExcelImg from "../../../assets/images/Microsoft_Office_Excel_(2019–present).svg.png";
import UploadService from "../../../services/uploadService";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "flex",
    flexWrap: "nowrap",
    "& > :not(style)": {
      margin: theme.spacing(1),
      width: "80%",
      height: "auto",
    },
  },
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
    marginTop: theme.spacing(4),
    marginLeft: theme.spacing(4),
    variant: "contained",
    color: "primary",
  },
  fileList: {
    marginTop: theme.spacing(2),
    maxHeight: "150px",
    overflowY: "auto",
  },
  infoBox: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    height: "80%",
    padding: theme.spacing(2),
  },
  fileDisplay: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  fileIcon: {
    marginRight: theme.spacing(1),
  },
}));

interface Aris66xDropZoneProps {
  onFileChange?: (file: File) => void;
  onUpload?: () => void;
  handleFileUpload: (file: File) => void;
}

const Aris66xDropZone: React.FC<Aris66xDropZoneProps> = ({
  onFileChange,
  onUpload,
  handleFileUpload,
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
    if (onUpload) {
      onUpload();
    }
  }, [onUpload]);

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
              {selectedFile ? (
                <div className={classes.fileDisplay}>
                  <img
                    src={ExcelImg}
                    alt="Excel Icon"
                    style={{ width: 48, height: 48 }}
                    className={classes.fileIcon}
                  />
                  <Typography>{selectedFile.name}</Typography>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`${classes.dropzone} ${isDragActive ? "active" : ""
                    }`}
                >
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop a file here, or click to select a file</p>
                </div>
              )}
            </Paper>
            <Grid item xs={3}>
              <Paper elevation={4} className={classes.infoBox}>
                <Typography variant="body2">
                  Additional information goes here...
                </Typography>
              </Paper>
            </Grid>
          </Box>

          <Button
            className={classes.uploadButton}
            onClick={() => handleFileUpload(selectedFile!)}
          >
            Upload
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default Aris66xDropZone;
