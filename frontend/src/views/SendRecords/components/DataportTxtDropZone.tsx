import React, { useState } from "react";

import DropZoneComponent from "../../../components/DropZoneComponent";
import {
  DatsExcelModel,
  ExcelData,
  extractDataport,
} from "../../../utils/xlsxUtils";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { TransferService } from "../../../services/transferService";

const acceptedFileTypes = {
  "text/plain": [".txt"]
};
interface Aris66xDropZoneProps {
  validate: (isValid: boolean, errorMessage: string) => void;
  setFile: (file: File | null) => void;
  setExcelData: (data: any) => void;
}
export const DataportTxtDropZone: React.FC<Aris66xDropZoneProps> = ({
  validate,
  setFile,
  setExcelData,
}) => {
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [data, setData] = useState<DatsExcelModel | null>(null);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [clearFilesSignal, setClearFilesSignal] = useState(false);
  const transferService = new TransferService();
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckboxChecked(event.target.checked);
    validate(event.target.checked, "");
  };

  const handleFilesAccepted = async (files: File[]) => {
    debugger;
    setClearFilesSignal(false);
    const file = files[0];
    if (file) {
      try {
        const extractedData = await extractDataport(file);
        if (extractedData) {
            debugger;
          transferService.getTransferByApplicationAccessionNumber(
            extractedData.accessionNumber,
            extractedData.applicationNumber,
            (response) => {
              debugger;
              if (response) {
                console.log("validation failed for duplicate transfer");
                validate(
                  false,
                  `A transfer with Acc # ${extractedData.accessionNumber} and App # ${extractedData.applicationNumber} has already been submitted. Please contact the Government Information Management Branch for more information.`
                );
                setIsCheckboxChecked(false);
                setExcelData(null);
                setData(null);
                setFile(null);
                setAcceptedFiles([]);
                setClearFilesSignal(true);
              } 
            },
            (error) => {
              if(error.response.status == 404) //transfer not found
              {
                setData(extractedData);
                setExcelData(extractedData);
                console.log("Aris66xDropZone" + file); // This is the file that was uploaded
                setFile(file);
                validate(isCheckboxChecked, "");
              }
              else
              {
                //anyother error
                debugger;
              console.log('404 transfer not found')
              validate(false, error);
              setIsCheckboxChecked(false);
              setExcelData(null);
              setData(null);
              setFile(null);
              }
            }
          );
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      //clear validations
      setIsCheckboxChecked(false);
      setExcelData(null);
      setData(null);
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

  const handleClearFilesSignalReset = () => {
    setClearFilesSignal(false);
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
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              padding: 2,
              maxHeight: "80vh",
              overflowY: "auto",
              border: "1px solid #ccc",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Extracted Data
            </Typography>
            <List hidden={!data}>
              <ListItem>
                <ListItemText
                  primary={`Accession #: ${data?.accessionNumber}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={`Application #: ${data?.applicationNumber}`}
                />
              </ListItem>
            </List>
          </Box>
        </Grid>
      </Grid>
      <FormControlLabel
        control={
          <Checkbox
            checked={isCheckboxChecked}
            onChange={handleCheckboxChange}
            disabled={!data}
          />
        }
        label="I confirm the Accession # and the Application number"
      />
    </Box>
  );
};
