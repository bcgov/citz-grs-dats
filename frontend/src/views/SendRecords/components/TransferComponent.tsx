import React, { useState, useEffect, useImperativeHandle, ForwardRefRenderFunction, forwardRef, FC } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ITransferDTO from "../../../types/DTO/Interfaces/ITransferDTO";
enum DATSActions {
  FolderSelected,
  FileSelected,
  MultipleFilesSelected,
  FileInformation,
  Cancelled,
  Progress,
  Error,
  Completed,
  FolderUpload,
  CheckFolder,
  FileFolderExists,
  FileFolderNotExists,
}
type Props = {
  transfer: ITransferDTO;
  validate: (isValid: boolean, errorMessage: string) => void;
};

;

const TransferComponent: ForwardRefRenderFunction<unknown, Props> = ({ transfer, validate }, ref) => {
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: Number }>(
    {}
  );
  const [thirdPartyStatus, setThirdPartyStatus] = useState<{
    [key: string]: Number;
  }>({});

  const SUCCESS: Number = 1;
  const FAIL: Number = 2;
const PROGRESS: Number = 0;
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:50504/ws/react");

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
        case DATSActions.FileFolderExists:
          setThirdPartyStatus((prevState) => ({
            ...prevState,
            [data.Payload.Message]: SUCCESS,
          }));
          break;
        case DATSActions.FileFolderNotExists:
          setThirdPartyStatus((prevState) => ({
            ...prevState,
            [data.Payload.Message]: FAIL,
          }));
          validate(false,`unable to find ${data.Payload.Message}`);
          break;
          case DATSActions.Progress:
            setUploadStatus((prevState) => ({
                ...prevState,
                [data.Payload.Message]: SUCCESS
            }));
            break;
            case DATSActions.Error:
                setUploadStatus((prevState) => ({
                    ...prevState,
                    [data.Payload.Message]: FAIL
                }));
          validate(false,`upload failed for ${data.Payload.Message}`);
                break;

      }
    };

    sendMessageToService(
      JSON.stringify({
        Action: DATSActions.CheckFolder,
        Payload: {
          Paths: transfer.digitalFileLists?.map((file) => file.folder),
        },
      })
    );

    return () => {
      ws.close();
    };
  }, [transfer.digitalFileLists]);

  useImperativeHandle(ref, () => ({
    uploadAllFolders,
}));
// Function to update the status of all folders to PROGRESS
const setAllProgress = (transfer: ITransferDTO) => {
    setUploadStatus((prevState) => {
      // Create a new state object
      const newState = { ...prevState };
  
      // Iterate over each file and set the status to PROGRESS
      transfer.digitalFileLists?.forEach((file) => {
        newState[file.folder] = PROGRESS;
      });
  
      return newState;
    });
  };
  const uploadAllFolders = () : void => {
    //report(true, '');
    setAllProgress(transfer);
    sendMessageToService(
        JSON.stringify({
          Action: DATSActions.FolderUpload,
          Payload: {
            Paths: transfer.digitalFileLists?.map((file) => file.folder),
            TransferId: 'testId',
            UploadUrl: 'http://localhost:5000/upload-files'
          },
        })
      );
  };

  const sendMessageToService = (message: any) => {
    console.log(message);

    const logSocket = new WebSocket("ws://localhost:50504/ws/react/receive");
    logSocket.onopen = () => {
      logSocket.send(message);
      logSocket.close();
      console.log("message sent??!");
    };
    logSocket.onerror = (error) => {
      console.error("Log WebSocket error", error);
    };
  };
//   const handleUploadAll = () => {
//     setUploading(true);
//     const folders = transfer.digitalFileLists?.map(
//       (fileList) => fileList.folder
//     );

//     uploadAllFolders(folders!!).then((status) => {
//       setUploadStatus(status);
//       setUploading(false);
//     });
//   };

  const handleDelete = (folder: string) => {
    alert(`Delete folder: ${folder}`);
  };

  const getStatusIcon = (status?: Number) => {
    if (status === undefined) return null;
    if(status === FAIL) return <ErrorIcon color="error" />;
    if(status === SUCCESS) return <CheckCircleIcon color="success" />
    if(status === PROGRESS) return <CircularProgress size={24} />
    return status ? (
      <CheckCircleIcon color="success" />
    ) : (
      <ErrorIcon color="error" />
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Transfer Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Accession Number"
            value={transfer.accessionNumber}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Application Number"
            value={transfer.applicationNumber}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Producer Ministry"
            value={transfer.producerMinistry}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Transfer Status"
            value={transfer.transferStatus}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Folders
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Typography variant="body2" color="textSecondary">
              Folder
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" color="textSecondary">
              Size
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="body2" color="textSecondary">
              Number of Files
            </Typography>
          </Grid>
          <Grid item xs={3}></Grid>
        </Grid>
        {transfer.digitalFileLists?.map((fileList, index) => (
          <Grid container spacing={2} key={index} alignItems="center">
            <Grid item xs={5} sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                value={fileList.folder}
                fullWidth
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      {thirdPartyStatus[fileList.folder] === FAIL ? (
                        <>
                          <ErrorIcon color="error" />
                          <IconButton
                            size="small"
                            onClick={() => alert("Edit clicked")}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        getStatusIcon(thirdPartyStatus[fileList.folder])
                      )}
                    </InputAdornment>
                  ),
                }}
                error={thirdPartyStatus[fileList.folder] === FAIL}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                value={`1024 MB`}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                value={fileList.fileCount}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={2}>
              {getStatusIcon(uploadStatus[fileList.folder])}
            </Grid>
            <Grid item xs={1}>
              <IconButton
                color="secondary"
                onClick={() => handleDelete(fileList.folder)}
              >
                <DeleteIcon color="primary" />
              </IconButton>
            </Grid>
          </Grid>
        ))}
      </Box>
    </Box>
  );
};

export default forwardRef(TransferComponent);
