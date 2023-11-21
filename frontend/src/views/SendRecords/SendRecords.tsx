import React, { ReactElement, FC } from "react";
import { Box, Typography } from "@mui/material";
import FileUploadComponent from "./components/FileUploadComponent";

const SendRecords: FC<any> = (): ReactElement => {
  return (
    <Box>
      <FileUploadComponent />
    </Box>
  );
};

export default SendRecords;
