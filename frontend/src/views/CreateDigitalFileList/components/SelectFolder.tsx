import { Box, Button, Checkbox, CircularProgress, Container, Grid, IconButton, Paper, TextField, Typography } from "@mui/material";
import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
interface Folder {
  name: string;
  schedule: string;
  primarySecondary: string;
  fileId: string;
  opr: boolean;
  startDate: Date | null;
  endDate: Date | null;
  soDate: Date | null;
  fdDate: Date | null;
  payload: string;
}
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
    const initialFolders: Folder[] = [
      {
        name: 'c:folder1',
        schedule: '164437',
        primarySecondary: '29900-05',
        fileId: '72653',
        opr: false,
        startDate: new Date('2000-01-02'),
    endDate: new Date('2009-12-22'),
    soDate: new Date('2009-12-31'),
    fdDate: new Date('2009-12-31'),
        payload: ''
      },
      {
        name: 'Z:Folders2',
        schedule: '164437',
        primarySecondary: '29920-30',
        fileId: '',
        opr: false,
        startDate: new Date('2000-01-02'),
        endDate: new Date('2009-12-22'),
        soDate: new Date('2009-12-31'),
        fdDate: new Date('2009-12-31'),
        payload: ''

      },
    ];
const SelectFolder: FC = () => {
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [folders, setFolders] = React.useState<Folder[]>([]);

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
                setFolders(prevFolders => [...prevFolders, {
                  name: data.Payload.Path,
                  schedule: '164437',
                  primarySecondary: '29900-05',
                  fileId: '72653',
                  opr: false,
                  startDate: new Date('2000-01-02'),
                  endDate: new Date('2009-12-22'),
                  soDate: new Date('2009-12-31'),
                  fdDate: new Date('2009-12-31'),
                  payload: event.data
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
const handleChange = (index: number, field: keyof Folder, value: any) => {
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
                  value={folder.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
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
        <Button variant="contained" color="secondary">
          Generate Digital File List
        </Button>
      </Box>
    </Box>
  );
};

export default SelectFolder;
