import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Grid,
  Icon,
  IconButton,
  Paper,
  TextField,
  TextFieldProps,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import {
  IFolderInformation,
  IFileInformation,
} from "../../../types/DTO/Interfaces/IFolderInformation";
import { generateExcel } from "../../../utils/xlsxUtils";
import InfoIcon from '@mui/icons-material/Info';
import { format } from "date-fns";
import { WEBSOCKET_URL } from "../../../types/constants";

enum DATSActions {
  FolderSelected,
  FileSelected,
  MultipleFilesSelected,
  FileInformation,
  Cancelled,
  Progress,
  Error,
  Completed,
}

const SelectFolder: FC = () => {
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [folders, setFolders] = React.useState<IFolderInformation[]>([]);
  const [isBusy,setIsBusy] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);
  const leaveDelay: number = 300;
  const enterDelay: number = 200;

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
    ws.onmessage = (event) => {
      console.log(event.data);
      const data = JSON.parse(event.data);
      switch (data.Action) {
        case DATSActions.Progress:
          console.log("setting progress");
          setProgress(data.Payload.Progress);
          setMessage(data.Payload.Message);
          setIsBusy(true);
          break;
        case DATSActions.Completed:
          setProgress(data.Payload.Progress);
          setMessage(data.Payload.Message);
          setIsBusy(true);
          break;
        case DATSActions.FileInformation:
          setFolders((prevFolders) => [
            ...prevFolders,
            {
              path: data.Payload.Path,
              schedule: "",
              primarySecondary: "",
              fileId: "",
              opr: false,
              startDate: null,
              endDate: null,
              soDate: null,
              fdDate: null,
              files: data.Payload.Files.map((obj: any) => ({
                path: obj.Path,
                checksum: obj.Checksum,
                dateCreated: obj.DateCreated,
                dateModified: obj.DateModified,
                dateAccessed: obj.DateAccessed,
                dateLastSaved: obj.DateLastSaved,
                programName: obj.ProgramName,
                owner: obj.Owner,
                computer: obj.Computer,
                contentType: obj.ContentType,
                sizeInBytes: obj.SizeInBytes,
                company: obj.Company,
                revisionNumber: "",
                fileId: "",
                name: obj.FileName,
              })),
            },
          ]);
          setIsBusy(false);
          break;
          case DATSActions.Cancelled:
            setIsBusy(false);
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
        setMessage("User canceled the dialog.");
      } else if (data.progress !== undefined) {
        setProgress(data.progress);
        setIsBusy(false);
      }
    };

    return () => {
      ws.close();
    };
  }, [isBusy]);

  const openDesktopApp = () => {
    setIsBusy(true);
    window.location.href = `citz-grs-dats://open?browse=folder`;
  };

  const handleDeleteFolder = (index: number) => {
    const newFolders = folders.filter((_, i) => i !== index);
    setFolders(newFolders);
  };

  const handleChange = (
    index: number,
    field: keyof IFolderInformation,
    value: any
  ) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder, i) =>
        i === index ? { ...folder, [field]: value } : folder
      )
    );
  };
  const handleTooltipClick = (header: string) => {
    setTooltipOpen((prev) => (prev === header ? null : header));
  };

  const headers = [
    { title: "Folder", info: "Information about Folder", sm: 1.5 },
    { title: "Schedule", info: "Information about Schedule", sm: 1 },
    { title: "P/S", info: "Information about Primary/Secondary", sm: 1 },
    { title: "FILE", info: "Information about File", sm: 1 },
    { title: "OPR", info: "Information about OPR", sm: 0.5 },
    { title: "Start Date", info: "Information about Start Date", sm: 1.5 },
    { title: "End Date", info: "Information about End Date", sm: 1.5 },
    { title: "SO Date", info: "Information about SO Date", sm: 1.5 },
    { title: "FD Date", info: "Information about FD Date", sm: 1.5 },
    { title: "Actions", info: "Information about Actions", sm: 0.5 },
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        List of selected folders
      </Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openDesktopApp}
          disabled={isBusy} // Disable button while progress is active
        >
          Add Folder
        </Button>
        {isBusy && (
          <Box ml={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1} alignItems="center">
          {headers.map((header) => (
            <Grid item xs={12} sm={header.sm} key={header.title}>
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  textDecoration: "underline dashed",
                  cursor: "help",
                }}
                onClick={() => handleTooltipClick(header.title)}
              >
                <Typography variant="subtitle2">{header.title}</Typography>
                <Tooltip
                  title={header.info}
                  enterDelay={enterDelay}
                  leaveDelay={300}
                  placement="top"
                  arrow
                  open={tooltipOpen === header.title}
                  onClose={() => setTooltipOpen(null)}
                >
                  <span />
                </Tooltip>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {folders.map((folder, index) => (
          <Paper elevation={0} key={index} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={1.5}>
                <TextField
                  value={folder.path}
                  onChange={(e) => handleChange(index, "path", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <TextField
                  value={folder.schedule}
                  onChange={(e) =>
                    handleChange(index, "schedule", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <TextField
                  value={folder.primarySecondary}
                  onChange={(e) =>
                    handleChange(index, "primarySecondary", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <TextField
                  value={folder.fileId}
                  onChange={(e) =>
                    handleChange(index, "fileId", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={0.5}>
                <Checkbox
                  checked={folder.opr}
                  onChange={(e) => handleChange(index, "opr", e.target.checked)}
                />
              </Grid>
              <Grid item xs={12} sm={1.5}>
                <DatePicker
                  value={folder.startDate}
                  onChange={(date) => handleChange(index, "startDate", date)}
                  format="yyyy-MM-dd"
                />
              </Grid>
              <Grid item xs={12} sm={1.5}>
                <DatePicker
                  value={folder.endDate}
                  onChange={(date) => handleChange(index, "endDate", date)}
                  format="yyyy-MM-dd"
                />
              </Grid>
              <Grid item xs={12} sm={1.5}>
                <DatePicker
                  value={folder.soDate}
                  onChange={(date) => handleChange(index, "soDate", date)}
                  format="yyyy-MM-dd"
                />
              </Grid>
              <Grid item xs={12} sm={1.5}>
                <DatePicker
                  value={folder.fdDate}
                  onChange={(date) => handleChange(index, "fdDate", date)}
                  format="yyyy-MM-dd"
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
        <Button
          variant="contained"
          color="secondary"
          disabled={(isBusy && folders.length === 0) || folders.length === 0 }
          onClick={() => generateExcel(folders)}
        >
          Generate Digital File List
        </Button>
      </Box>
    </Box>
  );
};

export default SelectFolder;
