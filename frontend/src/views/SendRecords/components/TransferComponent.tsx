import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ITransferDTO from '../../../types/DTO/Interfaces/ITransferDTO';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel, faFileWord, faFileImage, faFileAlt } from '@fortawesome/free-solid-svg-icons';

type Props = {
    transfer: ITransferDTO;
};

const TransferComponent: React.FC<Props> = ({ transfer }) => {
    const [open, setOpen] = React.useState<{ [key: string]: boolean }>({});
    const getFileIcon = (fileName: string) => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
          case 'pdf':
              return faFilePdf;
          case 'xlsx':
          case 'xls':
              return faFileExcel;
          case 'doc':
          case 'docx':
              return faFileWord;
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
              return faFileImage;
          default:
              return faFileAlt;
      }
  };
    const handleClick = (folder: string) => {
        setOpen(prevState => ({
            ...prevState,
            [folder]: !prevState[folder]
        }));
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6">Transfer Details</Typography>
            <Typography variant="body1">Accession Number: {transfer.accessionNumber}</Typography>
            <Typography variant="body1">Application Number: {transfer.applicationNumber}</Typography>
            <Typography variant="body1">Transfer Status: {transfer.transferStatus}</Typography>
            <Typography variant="body1">Producer Ministry: {transfer.producerMinistry}</Typography>
            <Typography variant="body1">Producer Branch: {transfer.producerBranch}</Typography>

            {transfer.digitalFileLists?.map((fileList, index) => (
                <Box key={index} sx={{ mt: 2 }}>
                    <ListItem button onClick={() => handleClick(fileList.folder)}>
                        <ListItemIcon>
                            <FolderIcon />
                        </ListItemIcon>
                        <ListItemText primary={`Folder: ${fileList.folder}`} />
                        {open[fileList.folder] ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={open[fileList.folder]} timeout="auto" unmountOnExit>
                        <TableContainer component={Paper} sx={{ pl: 4, mt: 1 }}>
                            <Table aria-label="files table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>File Name</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Size</TableCell>
                                        <TableCell>Created</TableCell>
                                        <TableCell>Modified</TableCell>
                                        <TableCell>Accessed</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fileList.digitalFiles?.map((file) => (
                                        <TableRow key={file.filePath}>
                                            <TableCell>
                                            <ListItemIcon>
                                                    <FontAwesomeIcon icon={getFileIcon(file.fileName)} size="lg"/>
                                                </ListItemIcon>
                                              {file.fileName}</TableCell>
                                            <TableCell>{file.contenType}</TableCell>
                                            <TableCell>{file.size}</TableCell>
                                            <TableCell>{new Date(file.objectCreateDate).toLocaleString()}</TableCell>
                                            <TableCell>{new Date(file.lastModifiedDate).toLocaleString()}</TableCell>
                                            <TableCell>{new Date(file.lastAccessDate).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Collapse>
                </Box>
            ))}
        </Box>
    );
};

export default TransferComponent;
