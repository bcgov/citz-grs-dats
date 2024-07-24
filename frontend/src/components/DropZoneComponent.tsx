import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, IconButton, Paper, Snackbar, Alert, Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel, faFileImage, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import DeleteIcon from '@mui/icons-material/Delete';

interface DropzoneComponentProps {
  accept: {
    [key: string]: string[];
  };
  onFilesAccepted: (files: File[]) => void;
  allowFolders?: boolean; // Optional prop to allow folders
  onDeleteFile?: (file: File) => void; // Prop for deleting individual files
  onClearAllFiles?: () => void; // Prop for clearing all files
  clearFilesSignal?: boolean; // Signal from parent to clear files
  placeHolder?: string;
  maxFiles?: number; // Maximum number of files allowed
}

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({
  accept,
  onFilesAccepted,
  allowFolders = false,
  onDeleteFile,
  onClearAllFiles,
  clearFilesSignal,
  placeHolder = 'Drop your files here',
  maxFiles = 1 // Default to 1 file if not specified
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isInvalidDrop, setIsInvalidDrop] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    let newFiles = [...files, ...acceptedFiles];
    if (newFiles.length > maxFiles) {
      newFiles = newFiles.slice(0, maxFiles);
    }
    setFiles(newFiles);
    onFilesAccepted(newFiles);
    setIsInvalidDrop(false);
  }, [files, maxFiles, onFilesAccepted]);

  const onDropRejected = useCallback(() => {
    setIsInvalidDrop(false);
    setSnackbarOpen(true);
  }, []);

  const onDragEnter = useCallback((event: React.DragEvent) => {
    const items = event.dataTransfer.items;
    const isValid = Array.from(items).some(item => {
      const fileType = item.type;
      return Object.keys(accept).some(type => fileType === type || fileType.startsWith(type));
    });
    setIsInvalidDrop(!isValid);
  }, [accept]);

  const onDragLeave = useCallback(() => {
    setIsInvalidDrop(false);
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const removeFile = (file: File, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Prevent the file picker from opening
    const newFiles = files.filter(f => f !== file);
    setFiles(newFiles);
    onFilesAccepted(newFiles);
    if (onDeleteFile) {
      onDeleteFile(file);
    }
  };

  const clearAllFiles = () => {
    setFiles([]);
    onFilesAccepted([]);
    if (onClearAllFiles) {
      onClearAllFiles();
    }
  };

  useEffect(() => {
    if (clearFilesSignal) {
      clearAllFiles();
    }
  }, [clearFilesSignal]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    onDragEnter,
    onDragLeave,
    accept,
    noDragEventsBubbling: !allowFolders,
    multiple: maxFiles > 1
  });

  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FontAwesomeIcon icon={faFileImage} size="2x" />;
    } else if (mimeType === 'application/pdf') {
      return <FontAwesomeIcon icon={faFilePdf} size="2x" />;
    } else if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return <FontAwesomeIcon icon={faFileExcel} size="2x" />;
    } else {
      return <FontAwesomeIcon icon={faFileAlt} size="2x" />;
    }
  };

  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #cccccc',
          borderRadius: 2,
          padding: 2,
          textAlign: 'center',
          cursor: isInvalidDrop ? 'not-allowed' : 'pointer',
          bgcolor: isInvalidDrop ? 'background.paper' : isDragActive ? '#f0f0f0' : 'background.paper',
          backgroundImage: isInvalidDrop ? 'repeating-linear-gradient(45deg, #ffcccc, #ffcccc 10px, #ff6666 10px, #ff6666 20px)' : 'none',
          color: isInvalidDrop ? 'error.contrastText' : 'text.primary',
          width: '100%',  // You can set a specific width here, like '100%' or '500px'
          height: '300px' // You can set a specific height here, like '300px'
        }}
      >
        <input {...getInputProps()} webkitdirectory={allowFolders ? "true" : undefined} directory={allowFolders ? "true" : undefined} />
        <Typography variant="h6">
          {placeHolder}
        </Typography>
        <List>
          {files.map((file, index) => (
            <ListItem key={index} component={Paper} sx={{ marginTop: 1 }}>
              <ListItemIcon>
                {getIcon(file.type)}
              </ListItemIcon>
              <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
              <IconButton edge="end" aria-label="delete" onClick={(event) => removeFile(file, event)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          File type not accepted. Please upload a valid file.
        </Alert>
      </Snackbar>
    </>
  );
};

export default DropzoneComponent;
