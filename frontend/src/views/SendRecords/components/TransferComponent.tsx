import React from 'react';
import {
    Box,
    Typography,
    TextField,
    Grid,
    Button
} from '@mui/material';
import ITransferDTO from '../../../types/DTO/Interfaces/ITransferDTO';
import { IDigitalFileDTO } from '../../../types/DTO/Interfaces/IDigitalFileListDTO';

type Props = {
    transfer: ITransferDTO;
};

const TransferComponent: React.FC<Props> = ({ transfer }) => {
    const calculateFolderSize = (files: IDigitalFileDTO[]) => {
        const totalSize = files.reduce((acc, file) => acc + parseFloat(file.size), 0);
        return totalSize.toFixed(2); // Rounding to 2 decimals
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
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                            
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
                    <Grid item xs={2}></Grid>
                </Grid>
                {transfer.digitalFileLists?.map((fileList, index) => (
                    <Grid container spacing={2} key={index} alignItems="center">
                        <Grid item xs={7}>
                            <TextField
                                value={fileList.folder}
                                fullWidth
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                value={`${calculateFolderSize(fileList.digitalFiles!!)} MB`}
                                fullWidth
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                value={fileList.digitalFiles?.length}
                                fullWidth
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            <Button variant="contained" fullWidth>
                                Upload
                            </Button>
                        </Grid>
                    </Grid>
                ))}
            </Box>
        </Box>
    );
};

export default TransferComponent;
