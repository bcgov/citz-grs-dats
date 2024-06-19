import React, { useState } from "react";
import DropZoneComponent from "../../../components/DropZoneComponent";
import {
  Box,
  Grid,
} from "@mui/material";

const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
};

interface Aris617DropZoneProps {
  validate: (isValid: boolean, errorMessage: string) => void;
  setFile: (file: File | null) => void;
}

const Aris617DropZone: React.FC<Aris617DropZoneProps> = ({
  validate,
  setFile,
}) => {
  
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [clearFilesSignal, setClearFilesSignal] = useState(false);


  const handleFilesAccepted = async (files: File[]) => {
    setClearFilesSignal(false);
    const file = files[0];
    if (file) {
      try {
                console.log("Aris617DropZone" + file); // This is the file that was uploaded
                setFile(file);
                validate(true, "");
      } catch (error) {
        console.error(error);
      }
    } else {
      //clear validations
      setFile(null);
    }
  };
  const handleDeleteFile = (file: File) => {
    const newFiles = acceptedFiles.filter((f) => f !== file);
    setAcceptedFiles(newFiles);
  };

  const handleClearAllFiles = () => {
    setAcceptedFiles([]);
    setClearFilesSignal(true);
  };


  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
    <Grid container spacing={2}>
      <Grid item xs={12} md={7}>
        <DropZoneComponent
          accept={acceptedFileTypes}
          onFilesAccepted={handleFilesAccepted}
          onDeleteFile={handleDeleteFile}
          onClearAllFiles={handleClearAllFiles}
          clearFilesSignal={clearFilesSignal}
        />
      </Grid>
    </Grid>
  </Box>
  );
};

export default Aris617DropZone;