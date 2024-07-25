import React, { forwardRef, useImperativeHandle, useState } from "react";

import DropZoneComponent from "../../../components/DropZoneComponent";
import {
  DatsExcelModel,
  ExcelData,
  extractExcelData,
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
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
};
interface Aris66xDropZoneProps {
  showValidationMessage: (isValid: boolean, errorMessage: string) => void;
  setFile: (file: File | null) => void;
  setExcelData: (data: any) => void;
}
export const Aris66xDropZone = forwardRef((props: Aris66xDropZoneProps, ref) => {
  const { showValidationMessage, setFile, setExcelData } = props;


  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [data, setData] = useState<DatsExcelModel | null>(null);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [clearFilesSignal, setClearFilesSignal] = useState(false);
  const transferService = new TransferService();
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckboxChecked(event.target.checked);
    showValidationMessage(event.target.checked,"");
  };

  const validateInputs = ():boolean  => {
    if(!isCheckboxChecked)
    {
      showValidationMessage(false, "Please check & confirm the applicaton and accession number");
    }
    return isCheckboxChecked;
  }

  useImperativeHandle(ref, () => ({
    validateInputs,
  }));

  
  const handleFilesAccepted = async (files: File[]) => {
    setClearFilesSignal(false);
    const file = files[0];
    if (file) {
      try {
        const extractedData = await extractExcelData(file);
        if (extractedData) {
          transferService.getTransferByApplicationAccessionNumber(
            extractedData.accessionNumber,
            extractedData.applicationNumber,
            (response) => {
              if (response) {
                console.log("validation failed for duplicate transfer");
                showValidationMessage(
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
              if (error.response.status == 404) {
                //transfer not found
                setData(extractedData);
                setExcelData(extractedData);
                setFile(file);
                showValidationMessage(isCheckboxChecked, "");
              } else {
                //anyother error
                console.log("404 transfer not found");
                showValidationMessage(false, error);
                setIsCheckboxChecked(false);
                setExcelData(null);
                setData(null);
                setFile(null);
                setAcceptedFiles([]);
                setClearFilesSignal(true);
              }
            }
          );
        }
      } catch (error) {
        console.log(error);
        showValidationMessage(false, String(error));
        setIsCheckboxChecked(false);
        setExcelData(null);
        setData(null);
        setFile(null);
        setAcceptedFiles([]);
        setClearFilesSignal(true);
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
            placeHolder="Drop File List (ARS 662)"
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <Box hidden={!data}
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
            <List>
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
        label="I confirm the Accession and Application numbers."
      />
    </Box>
  );
});
