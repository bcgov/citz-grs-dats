import { Box, Button, Checkbox, CircularProgress, Container, Grid, IconButton, Paper, TextField, Typography } from "@mui/material";
import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { IFolderInformation, IFileInformation } from "../../../types/DTO/Interfaces/IFolderInformation";
import { generateExcel} from "../../../utils/xlsxUtils";
enum DATSActions
    {
        FolderSelected,
        FileSelected,
        MultipleFilesSelected,
        FileInformation,
        Cancelled,
        Progress,
        Error,
        Completed
    }
    
const SelectFolder: FC = () => {
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [folders, setFolders] = React.useState<IFolderInformation[]>([]);

  useEffect(() => {
      const ws = new WebSocket('ws://localhost:50504/ws/react');

ws.onopen = () => {
  console.log('WebSocket connection established');
};
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};
      ws.onmessage = (event) => {
        console.log(event.data);
          const data = JSON.parse(event.data);
          switch(data.Action)
          {
            case DATSActions.Progress:
              console.log('setting progress');
              setProgress(data.Payload.Progress);
              setMessage(data.Payload.Message);
              break;
              case DATSActions.Completed:
                setProgress(data.Payload.Progress);
              setMessage(data.Payload.Message);
              break;
              case DATSActions.FileInformation:
                debugger;
                setFolders(prevFolders => [...prevFolders, {
                  path: data.Payload.Path,
                  schedule: '',
                  primarySecondary: '',
                  fileId: '',
                  opr: false,
                  startDate: null,
                  endDate: null,
                  soDate: null,
                  fdDate: null,
                  files: data.Payload.Files.map((obj: any) => ({
                    path: obj.Path,
    checksum:  obj.Checksum,
    dateCreated: obj.DateCreated,
    dateModified:obj.DateModified,
    dateAccessed: obj.DateAccessed,
    dateLastSaved: obj.DateLastSaved,
    programName: obj.ProgramName,
    owner: obj.Owner,
    computer:obj.Computer,
    contentType:obj.ContentType,
    sizeInBytes: obj.SizeInBytes,
    company: obj.Company,
    revisionNumber: '',
    fileId: '',
    name: obj.FileName

                }))
                }]);
                break;
          }
          if (data.path) {
            console.log(data);
              setMessage(`Selected Path: ${data.path}`);
          } else if (data.error) {
            console.log(data);
              setMessage(`Error: ${data.error}`);
          } else if (data.canceled) {
            console.log(data);
              setMessage('User canceled the dialog.');
          } else if (data.progress !== undefined) {
              setProgress(data.progress);
          }
      };

      return () => {
          ws.close();
      };
  }, []);
  const openDesktopApp = () => {
    window.location.href = `citz-grs-dats://open?browse=folder`;
};


const handleDeleteFolder = (index: number) => {
  const newFolders = folders.filter((_, i) => i !== index);
  setFolders(newFolders);
};
const handleChange = (index: number, field: keyof IFolderInformation, value: any) => {
  debugger;
  setFolders((prevFolders) =>
    prevFolders.map((folder, i) =>
      i === index ? { ...folder, [field]: value } : folder
    )
  );
};
  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Typography variant="h6">List of selected folders</Typography>
      <Box display="flex" alignItems="center">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openDesktopApp}
          disabled={progress > 0} // Disable button while progress is active
        >
          Add Folder
        </Button>
        {progress > 0 && (
          <Box ml={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} sm={1.5}>
            <Typography variant="subtitle2">Folder</Typography>
          </Grid>
          <Grid item xs={12} sm={1}>
            <Typography variant="subtitle2">Schedule</Typography>
          </Grid>
          <Grid item xs={12} sm={1}>
            <Typography variant="subtitle2">Primary/Secondary</Typography>
          </Grid>
          <Grid item xs={12} sm={1}>
            <Typography variant="subtitle2">FILE</Typography>
          </Grid>
          <Grid item xs={12} sm={0.5}>
            <Typography variant="subtitle2">OPR</Typography>
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <Typography variant="subtitle2">Start Date</Typography>
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <Typography variant="subtitle2">End Date</Typography>
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <Typography variant="subtitle2">SO Date</Typography>
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <Typography variant="subtitle2">FD Date</Typography>
          </Grid>
          <Grid item xs={12} sm={0.5}>
            <Typography variant="subtitle2">Actions</Typography>
          </Grid>
        </Grid>
      </Paper>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {folders.map((folder, index) => (
          <Paper elevation={0} key={index} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={1.5}>
                <TextField
                  value={folder.path}
                  onChange={(e) => handleChange(index, 'path', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <TextField
                  value={folder.schedule}
                  onChange={(e) =>
                    handleChange(index, 'schedule', e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <TextField
                  value={folder.primarySecondary}
                  onChange={(e) =>
                    handleChange(index, 'primarySecondary', e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <TextField
                  value={folder.fileId}
                  onChange={(e) => handleChange(index, 'fileId', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={0.5}>
                <Checkbox
                  checked={folder.opr}
                  onChange={(e) =>
                    handleChange(index, 'opr', e.target.checked)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <DatePicker
                  value={folder.startDate}
                  onChange={(date) => handleChange(index, 'startDate', date)}
                 
                />
              </Grid>
              <Grid item xs={12} sm={1.5}>
                <DatePicker
                  value={folder.endDate}
                  onChange={(date) => handleChange(index, 'endDate', date)}
                />
              </Grid>
              <Grid item xs={12} sm={1.5}>
                <DatePicker
                  value={folder.soDate}
                  onChange={(date) => handleChange(index, 'soDate', date)}
                />
              </Grid>
              <Grid item xs={12} sm={1.5}>
                <DatePicker
                  value={folder.fdDate}
                  onChange={(date) => handleChange(index, 'fdDate', date)}
                />
              </Grid>
              <Grid item xs={12} sm={0.5}>
                <IconButton onClick={() => handleDeleteFolder(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </LocalizationProvider>
      <Box my={2}>
        <Button variant="contained" color="secondary" onClick={() => generateExcel(folders)}>
          Generate Digital File List
        </Button>
      </Box>
    </Box>
  );
};

export default SelectFolder;
