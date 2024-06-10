import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Grid,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ITransferDTO from '../../../types/DTO/Interfaces/ITransferDTO';

type Props = {
    transfer: ITransferDTO;
};

const checkIfFolderExists = (folder: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(Math.random() > 0.5);
        }, 1000);
    });
};

const uploadAllFolders = (folders: string[]): Promise<{ [key: string]: boolean }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const status: { [key: string]: boolean } = {};
            folders.forEach((folder) => {
                status[folder] = Math.random() > 0.5;
            });
            resolve(status);
        }, 2000);
    });
};

const TransferComponent: React.FC<Props> = ({ transfer }) => {
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadStatus, setUploadStatus] = useState<{ [key: string]: boolean }>({});
    const [thirdPartyStatus, setThirdPartyStatus] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        transfer.digitalFileLists?.forEach((fileList) => {
            checkIfFolderExists(fileList.folder).then((status) => {
                setThirdPartyStatus(prevState => ({ ...prevState, [fileList.folder]: status }));
            });
        });
    }, [transfer.digitalFileLists]);

    const handleUploadAll = () => {
        setUploading(true);
        const folders = transfer.digitalFileLists?.map(fileList => fileList.folder);

        uploadAllFolders(folders!!).then((status) => {
            setUploadStatus(status);
            setUploading(false);
        });
    };

    const handleDelete = (folder: string) => {
        alert(`Delete folder: ${folder}`);
    };

    const getStatusIcon = (status?: boolean) => {
        if (status === undefined) return null;
        return status ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />;
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
                        <Grid item xs={5} sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                value={fileList.folder}
                                fullWidth
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {thirdPartyStatus[fileList.folder] === false ? (
                                                <>
                                                    <ErrorIcon color="error" />
                                                    <IconButton size="small" onClick={() => alert('Edit clicked')}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </>
                                            ) : (
                                                getStatusIcon(thirdPartyStatus[fileList.folder])
                                            )}
                                        </InputAdornment>
                                    ),
                                }}
                                error={thirdPartyStatus[fileList.folder] === false}
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
                            {uploading ? (
                                <CircularProgress size={24} />
                            ) : (
                                getStatusIcon(uploadStatus[fileList.folder])
                            )}
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton
                                color="secondary"
                                onClick={() => handleDelete(fileList.folder)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Box mt={2}>
                    <Button
                        variant="contained"
                        onClick={handleUploadAll}
                        disabled={uploading}
                    >
                        {uploading && <CircularProgress size={24} color="inherit" />}
                        {uploading ? 'Uploading...' : 'Upload All'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default TransferComponent;
