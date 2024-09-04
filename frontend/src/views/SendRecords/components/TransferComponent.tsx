import React, {
  useState,
  useEffect,
  useImperativeHandle,
  ForwardRefRenderFunction,
  forwardRef,
  FC,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  TextareaAutosize,
  DialogActions,
  DialogContentText,
  Tooltip,
} from "@mui/material";
import { readFileAsString } from "../../../utils/xlsxUtils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ITransferDTO from "../../../types/DTO/Interfaces/ITransferDTO";
import { getApiBaseUrl } from "../../../services/serverUrlService";
import { WEBSOCKET_PUSH_URL, WEBSOCKET_URL } from "../../../types/constants";
import { TransferService } from "../../../services/transferService";
import { TransferStatus } from "../../../types/Enums/TransferStatus";
import {arePathsEqual} from "../../../utils/pathHelpers";
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
  UploadProgress = 15,
  UploadSuccessfull = 16,
  DesktopAppClosing = 18,
  Indeterminate = 19,
}
type Props = {
  initialTransfer: ITransferDTO;
  isEdrms : boolean;
  filename: string | null,
  showValidationMessage: (isValid: boolean, errorMessage: string) => void;
  setAllFoldersUploaded: Dispatch<SetStateAction<boolean>>;
};

type EditableFields = {
  [key: string]: boolean;
};
type FolderValues = {
  [key: string]: string;
};
const TransferComponent: ForwardRefRenderFunction<unknown, Props> = (
  { initialTransfer, isEdrms,filename, showValidationMessage: validate, setAllFoldersUploaded },
  ref
) => {
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadEta, setUploadEta] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0); // jl test
  const [open, setOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const handleClickOpen = (folder: string) => {
    setFolderToDelete(folder);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFolderToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (folderToDelete) {
      debugger;

      // Retrieve the current digitalFileLists, defaulting to an empty array if undefined
      const currentFileLists = transfer.digitalFileLists ?? [];

      // Map through the digitalFileLists and update the `folderSend` property
      const updatedFileLists = currentFileLists.map((fileList) => {
        if (fileList.folder === folderToDelete) {
          return {
            ...fileList,
            folderSend: "Deleted", // Update the folderSend property
          };
        }
        return fileList;
      });

      // Log the updated file lists to verify the changes
      console.log(
        "Updated digitalFileLists with 'Deleted' folderSend:",
        updatedFileLists
      );
      debugger;

      // Find the fileList that needs to be updated in the service
      const fileListToUpdate = updatedFileLists.find(
        (fileList) => fileList.folder === folderToDelete
      );

      if (fileListToUpdate) {
        await new TransferService().updateDigitalFileList(fileListToUpdate);
      }

      // Proceed with the deletion
      setTransfer((prev) => ({
        ...prev,
        digitalFileLists:
          prev.digitalFileLists?.filter(
            (fileList) => fileList.folder !== folderToDelete
          ) ?? [],
      }));
    }

    // Close the dialog after deletion
    handleClose();
  };

  // end
  const [makeFieldsDisable, setMakeFieldsDisable] = useState<boolean>(false);
  const [transfer, setTransfer] = useState<ITransferDTO>(initialTransfer);
  const [editableFields, setEditableFields] = useState<EditableFields>({});
  const [enabledUploadIndex, setEnabledUploadIndex] = useState(0); // Track the enabled upload button
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const currentFolder = useRef<string | null>(null);
  const currentFolderNote = useRef<string | null>(null);
  const [note, setNote] = useState("");
  const [folderValues, setFolderValues] = useState<FolderValues>(
    transfer.digitalFileLists!!.reduce((acc, fileList) => {
      acc[fileList.folder] = fileList.folder;
      return acc;
    }, {} as FolderValues)
  );
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: Number }>(
    {}
  );
  const [thirdPartyStatus, setThirdPartyStatus] = useState<{
    [key: string]: Number;
  }>({});
  const SUCCESS: Number = 1;
  const FAIL: Number = 2;

  const PROGRESS: Number = 3;
  const INDETERMINATE = 4;
  const UNKNOWN: Number = 0;

  const [foldersUploaded, setFoldersUploaded] = useState(0);
  const [foldersTotal, setFoldersTotal] = useState(
    transfer.digitalFileLists?.map((obj) => obj.folder)?.length ?? 0
  );

  useEffect(() => {
    const foldersTotal: number =
      transfer.digitalFileLists?.map((obj) => obj.folder)?.length ?? 0;
    const foldersUploaded = Object.keys(Object.entries(uploadStatus).filter(([key]) => key !== 'null')).length;
    setFoldersUploaded(foldersUploaded);
    setFoldersTotal(foldersTotal);

    setAllFoldersUploaded(foldersTotal !== 0 && foldersTotal - foldersUploaded === 0);
  }, [uploadStatus, transfer, foldersTotal]);

  useEffect(() => {
    const statusEntries = Object.entries(thirdPartyStatus);
    const hasFailedStatus = statusEntries.some(
      ([key, status]) => status === FAIL
    );

    if (hasFailedStatus) {
      validate(
        false,
        `unable to find ${
          statusEntries.find(([key, status]) => status === FAIL)?.[0]
        }`
      );
    } else {
      validate(true, "");
    }
  }, [thirdPartyStatus]);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 3;
    const connectWebSocket = () => {
      const ws = new WebSocket(WEBSOCKET_URL);

      ws.onopen = () => {
        console.log("WebSocket connection established");
        setThirdPartyStatus({});
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        attempts += 1;
        if (attempts < maxAttempts) {
          console.log(`Retrying connection (${attempts}/${maxAttempts})...`);
          setTimeout(connectWebSocket, 1000); // Retry after 1 second
        } else {
          console.error(
            "Max retries reached. Unable to establish WebSocket connection."
          );
          validate(
            false,
            "unable to establish a connection to DATS Companion Service"
          );
        }
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };

      ws.onmessage = async (event) => {
        console.log(event.data);
        const data = JSON.parse(event.data);
        switch (data.Action) {
          case DATSActions.DesktopAppClosing:
            //this will get called on desktop closed
            break;
          case DATSActions.UploadProgress:
            console.log("setting progress");
            setUploadStatus((prevState) => ({
              ...prevState,
              [data.Payload.Message]: data.Payload.IsIndeterminate
                ? INDETERMINATE
                : PROGRESS,
            }));
            setUploadProgress(data.Payload.Progress);
            setUploadMessage(
              `( ${convertBytesToMB(
                data.Payload.BytesUploaded
              )}/${convertBytesToMB(data.Payload.TotalBytes)} MB)`
            );
            setUploadEta(data.Payload.ETA || "");
            break;
          case DATSActions.Cancelled:
            currentFolder.current = null;
            break;
          case DATSActions.FileInformation:

            if (currentFolder.current !== null) {
              setTransfer((prev) => {
                const updatedFileLists =
                  prev.digitalFileLists?.map((fileList) =>
                    arePathsEqual(fileList.folder,currentFolder.current!)
                      ? {
                          ...fileList,
                          folder: String(data.Payload.Path),
                          note: note,
                        }
                      : fileList
                  ) || [];

                // Check if any item matches the condition
                const hasMatchingFolder = prev.digitalFileLists?.some(
                  (fileList) => arePathsEqual(fileList.folder,currentFolder.current!)
                );

                // If no items match, add a new item to the array
                if (!hasMatchingFolder) {
                  updatedFileLists.push({
                    folder: String(data.Payload.Path),
                    _id: "",
                    size: data.Payload.SizeInBytes,
                    fileCount: data.Payload.FileCount,
                    transfer: "",
                  });
                }
                return {
                  ...prev,
                  digitalFileLists: updatedFileLists,
                };
              });
              currentFolder.current = null; // Reset the active index after update
            }
            break;
          case DATSActions.FileFolderExists:
            setThirdPartyStatus((prevState) => ({
              ...prevState,
              [data.Payload.Message]: SUCCESS,
            }));
            break;
          case DATSActions.FileFolderNotExists:
            setMakeFieldsDisable(false);
            setThirdPartyStatus((prevState) => ({
              ...prevState,
              [data.Payload.Message]: FAIL,
            }));
            // validate(false,`unable to find ${data.Payload.Message}`);
            break;
          case DATSActions.UploadSuccessfull:
            if (enabledUploadIndex === transfer.digitalFileLists!.length - 1) {
              validate(true, `All folders have been uploaded successfully`);
            }
            //completed
            setTimeout(async () => {
              setUploadStatus((prevState) => ({
                ...prevState,
                [data.Payload.Message]: SUCCESS,
              }));
              await new TransferService().updateTransfer({
                _id: transfer._id,
                accessionNumber: transfer.accessionNumber,
                applicationNumber: transfer.applicationNumber,
                transferStatus: TransferStatus.TrComplete,
              });
            }, 500);
            setEnabledUploadIndex((prevIndex) => prevIndex + 1);
            break;
          case DATSActions.Progress:
            console.log("setting progress");
            setUploadStatus((prevState) => ({
              ...prevState,
              [data.Payload.ProgressMessage]: INDETERMINATE,
            }));
            break;
          case DATSActions.Error:
            setUploadStatus((prevState) => ({
              ...prevState,
              [data.Payload.Message]: FAIL,
            }));
            validate(
              false,
              `upload failed for ${data.Payload.Message}. This transfer is rolled back, please contact administrator`
            );
            cancelAllProgress(transfer);
            break;
          case DATSActions.Completed:
            break;
        }
      };

      return ws;
    };

    const ws = connectWebSocket();

    return () => {
      ws.close();
    };
  }, [transfer.digitalFileLists]);

  const validateInputs = (): boolean => {
    if (enabledUploadIndex === transfer.digitalFileLists!.length - 1) {
      return true;
    } else {
      validate(false, "Please upload all folders ...");
      return false;
    }
  };
  useImperativeHandle(ref, () => ({
    validateInputs,
  }));

  const cancelAllProgress = (transfer: ITransferDTO) => {
    setUploadStatus((prevState) => {
      // Create a new state object
      const newState = { ...prevState };

      // Iterate over each file and set the status to CANCEL if it's currently PROGRESS
      transfer.digitalFileLists?.forEach((file) => {
        if (newState[file.folder] === PROGRESS) {
          newState[file.folder] = UNKNOWN;
        }
      });

      return newState;
    });
  };
  const uploadFolder = async (folder: string, index: number) => {
    //TODO:// move this api call to be called only once rather on every uplaod
    const baseUrl = await getApiBaseUrl();
    setMakeFieldsDisable(true);
    var digitalFile = transfer.digitalFileLists?.find(
      (p) => p.folder === folder
    );
    //build the payload
    var payload = {
      Action: DATSActions.FolderUpload,
      Payload: {
        Package: [
          {
            Path: digitalFile?.folder,
            Classification: digitalFile?.primarySecondary || "",
            Note: digitalFile?.note,
          },
        ],
        Filename: isEdrms ? filename : '',
        IsEdrms: isEdrms,
        TransferId: transfer._id,
        ApplicationNumber: transfer.applicationNumber,
        AccessionNumber: transfer.accessionNumber,
        UploadUrl: `${baseUrl}/api/upload-files`,
      },
    };
    var base64 = btoa(JSON.stringify(payload));
    console.log(base64);
    window.location.href = `citz-grs-dats://upload?payload=${base64}`;
  };

  const convertBytesToMB = (totalBytes: any): number | null => {
    const bytes = Number(totalBytes);

    if (!isNaN(bytes)) {
      const megabytes = bytes / (1024 * 1024);
      return parseFloat(megabytes.toFixed(2));
    } else {
      console.error("totalBytes is not a valid number.");
      return null;
    }
  };

  const handleValueChange = (
    folder: string,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    setFolderValues((prev) => ({
      ...prev,
      [folder]: newValue,
    }));
  };

  const handleAddFolder = (folder: string) => {
    currentFolder.current = folder;
    window.location.href = `citz-grs-dats://open?browse=folder`;
  };
  const handleEditClick = (folder: string) => {
    currentFolder.current = folder;
    setIsPopupOpen(true);
  };

  // const handlePopupOpen = (folder: string) => {
  //   const fileListItem = transfer.digitalFileLists!!.find((item) => item.folder === folder);
  //   setNote(fileListItem?.note || '');
  //   setIsPopupOpen(true);
  // };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setNote("");
  };
  const handleNoteSubmit = () => {
    setIsPopupOpen(false);
    currentFolderNote.current = note;
    console.log("note" + note);
    console.log("note ref" + currentFolderNote.current);
    window.location.href = `citz-grs-dats://open?browse=folder`;
  };
  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(event.target.value);
  };
  const getStatusIcon = (status?: Number) => {
    if (status === undefined) return null;
    if (status === UNKNOWN) return null;
    if (status === FAIL) return <ErrorIcon color="error" />;
    if (status === SUCCESS) return <CheckCircleIcon color="success" />;
    if (status === INDETERMINATE)
      return <CircularProgress color="primary" size={24} />;
    if (status === PROGRESS)
      return (
        <Box sx={{ width: "100%", mt: 2 }}>
          <Box sx={{ display: "block", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontSize: "0.6rem" }} gutterBottom>
              {uploadMessage}
            </Typography>
          </Box>
          <Box>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography
              sx={{ fontSize: "0.6rem" }}
              color="textSecondary"
            >{`${Math.floor(uploadProgress)}% (${uploadEta})`}</Typography>
          </Box>
        </Box>
      );
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
      {(!transfer.digitalFileLists ||
        transfer.digitalFileLists.length === 0) && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAddFolder("NEW_FOLDER")}
          >
            Add Digital File
          </Button>
        </Box>
      )}
      <Box mt={4}>
        <Typography
          sx={{
            marginBottom: "25px",
            padding: "5px",
            fontWeight: 700,
            borderRadius: "5px",
            border: "3px dashed #fcc203",
          }}
        >
          Please upload each folder using the upload icon to the right of each
          folder.
        </Typography>
        <Typography variant="h6" gutterBottom>
          Folders
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Folder
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="body2" color="textSecondary">
              Size
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="body2" color="textSecondary">
              Schedule
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="body2" color="textSecondary">
              Primary / Secondary
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="body2" color="textSecondary">
              Number of Files
            </Typography>
          </Grid>
          <Grid item xs={3}></Grid>
        </Grid>
        {transfer.digitalFileLists?.map((fileList, index) => (
          <Grid container spacing={2} key={index} alignItems="center">
            <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                disabled={makeFieldsDisable}
                onChange={(event) => handleValueChange(fileList.folder, event)}
                value={fileList.folder}
                fullWidth
                InputProps={{
                  readOnly: !editableFields[fileList.folder],
                  endAdornment: (
                    <InputAdornment position="end">
                      {thirdPartyStatus[fileList.folder] === FAIL ? (
                        <>
                          <ErrorIcon color="error" />
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(fileList.folder)}
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
            <Grid item xs={1}>
              <TextField
                value={fileList.size}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={fileList.schedule}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={fileList.primarySecondary}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={1}>
              <TextField
                value={fileList.fileCount}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={1}>
              {getStatusIcon(uploadStatus[fileList.folder])}
            </Grid>
            <Grid item xs={1}>
              <Tooltip title="Start Upload">
                <IconButton
                  disabled={!(index === foldersUploaded)}
                  color="primary"
                  onClick={() => uploadFolder(fileList.folder, index)}
                  sx={{
                    borderRadius: "5px",
                    border:
                      index === foldersUploaded ? "3px dashed #fcc203" : "none",
                  }}
                >
                  <UploadFileIcon
                    sx={{
                      color: index === foldersUploaded ? "primary" : "grey",
                    }}
                  />
                </IconButton>
              </Tooltip>
              <IconButton
                disabled={makeFieldsDisable}
                color="secondary"
                onClick={() => handleClickOpen(fileList.folder)} // Open the dialog with the folder name
              >
                <DeleteIcon color="primary" />
              </IconButton>
            </Grid>
            {/* Confirmation Dialog */}
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete the folder: {folderToDelete}?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleConfirmDelete} color="error">
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        ))}
      </Box>
      <Dialog open={isPopupOpen} onClose={handlePopupClose}>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <TextareaAutosize
            minRows={5}
            value={note}
            onChange={handleNoteChange}
            style={{ width: "100%" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePopupClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleNoteSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default forwardRef(TransferComponent);
