import React, { useState } from "react";

import DropZoneComponent from "../../../components/DropZoneComponent";
import { ExcelData, extractExcelData } from "../../../utils/xlsxUtils";
import { Box, Grid, List, ListItem, ListItemText, Typography } from "@mui/material";

const acceptedFileTypes = {
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

export const Aris66xDropZone =({ validate, setFile }: { validate: (isValid: boolean) => void, setFile: (file: File | null) => void }) => {
  const [data, setData] = useState<ExcelData[]>([]);

  const handleFilesAccepted = async (files: File[]) => {
    const file = files[0];
    if (file) {
      try {
        const extractedData = await extractExcelData(file);
        console.log('extractedData' + JSON.stringify(extractedData));
        setData(extractedData);
      } catch (error) {
        console.error(error);
      }
    }
    console.log('Aris66xDropZone' + file);  // This is the file that was uploaded
    setFile(file);
    validate(true);
    console.log('validated');
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
            <List>
              {data.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`${item.key}: ${item.value}`} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

