import React, { useState } from "react";

import DropZoneComponent from "../../../components/DropZoneComponent";

const acceptedFileTypes = {
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

export const Aris66xDropZone =({ validate, setFile }: { validate: (isValid: boolean) => void, setFile: (file: File | null) => void }) => {

  const handleFilesAccepted = (files: File[]) => {
    const file = files[0];
    console.log('Aris66xDropZone' + file);  // This is the file that was uploaded
    setFile(file);
    validate(true);
    console.log('validated');
  };
  return (
    <DropZoneComponent 
      accept={acceptedFileTypes}
      onFilesAccepted={handleFilesAccepted}
    />
  );
};

