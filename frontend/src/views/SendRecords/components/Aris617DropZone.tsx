import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import DropZoneComponent from "../../../components/DropZoneComponent";
import { Button, Input, TextField } from "@mui/material";
import { text } from "stream/consumers";

const acceptedFileTypes = {
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/pdf': ['.pdf'],
  'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
  'text/plain': ['.txt'],
};

interface FileMetadata {
  Name: string;
  Path: string;
  LastModified: Date;
  Md5: string;
}
const Aris617DropZone: React.FC = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [value, setValue] = useState('');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };
const handleClicked = async () => {
    console.log('clicked');
    const fileList = await getFileMetadata(value);
    setFiles(fileList);
}
  const handleFolderUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const filesArray = Array.from(event.target.files || []);
    if (filesArray.length === 0) {
      console.error("No files selected.");
      return;
    }

    const folderPath = filesArray[0].webkitRelativePath.split('/')[0];
    if (!folderPath) {
      console.error("No folder path found.");
      return;
    }

    const fileList = await getFileMetadata(folderPath);
    setFiles(fileList);
  };

  const getFileMetadata = async (folderPath: string): Promise<FileMetadata[]> => {
    const response = await fetch('http://localhost:5781/get-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ FolderPath : folderPath }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to fetch files');
      return [];
    }
  };

  return (
    <div>
      <TextField id="standard-basic" label="Standard" variant="standard" value={value} onChange={handleChange} />
      <Button onClick={handleClicked}>Click Me</Button>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            {file.Name} - {file.Path} - {new Date(file.LastModified).toLocaleString()} - {file.Md5}
          </li>
        ))}
      </ul>
    </div>
  );
  // return (
  //   <DropZoneComponent 
  //     accept={acceptedFileTypes}
  //     allowFolders={true}
  //     onFilesAccepted={async (files) => {
  //       const file = files[0];
  //       const folderPath = files[0].webkitRelativePath.split('/')[0];
  //       debugger;
  //         const response = await fetch('http://localhost:5781/get-files', {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json'
  //           },
  //           body: JSON.stringify({ folderPath })
  //         });
  //         if (response.ok) {
  //           const data = await response.json();
  //           debugger;
  //         } else {
  //           console.error('Failed to fetch files');
  //         }
  //     }}
  //   />
  // );
};

export default Aris617DropZone;
