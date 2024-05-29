import React, { useState } from "react";

import DropZoneComponent from "../../../components/DropZoneComponent";
import { DatsExcelModel, ExcelData, extractExcelData } from "../../../utils/xlsxUtils";
import { Box, Checkbox, FormControlLabel, FormLabel, Grid, List, ListItem, ListItemText, Radio, RadioGroup, Typography } from "@mui/material";

const acceptedFileTypes = {
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

export const Aris66xDropZone =({ validate, setFile, setExcelData }: { validate: (isValid: boolean) => void, setFile: (file: File | null) => void,  setExcelData: (data: DatsExcelModel | null) => void })  => {
  const [data, setData] = useState<DatsExcelModel | null>(null);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckboxChecked(event.target.checked);
    validate(event.target.checked);
  };

  const handleFilesAccepted = async (files: File[]) => {
    const file = files[0];
    if (file) {
      try {
        const extractedData = await extractExcelData(file);
        console.log('extractedData' + JSON.stringify(extractedData));
        setData(extractedData);
        setExcelData(extractedData);
        console.log('Aris66xDropZone' + file);  // This is the file that was uploaded
        setFile(file);
        validate(isCheckboxChecked);
        console.log('validated');
      } catch (error) {
        console.error(error);
      }
    }
    else
    {
      //clear validations
      setIsCheckboxChecked(false);
      setExcelData(null);
      setData(null);
      setFile(null);
    }
  };
  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
             <DropZoneComponent 
      accept={acceptedFileTypes}
      onFilesAccepted={handleFilesAccepted}
    />
        </Grid>
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              padding: 2,
              maxHeight: '80vh',
              overflowY: 'auto',
              border: '1px solid #ccc',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Extracted Data
            </Typography>
            <List hidden={!data}>
                <ListItem>
                  <ListItemText primary={`Accession #: ${data?.accessionNumber}`} />
                </ListItem>
                <ListItem>
                <ListItemText primary={`Application #: ${data?.applicationNumber}`} />
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

