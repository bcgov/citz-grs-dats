import React from "react";
import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataGridDemo from "./components/DigitalfileListGrid"
import SelectFolder from "./components/SelectFolder"
import DropZoneComponent from "./components/DropZoneComponent"

export default function CreateDigitalFileList() {
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null)

  interface FolderWithFiles {
    folderPath: string;
    files: string[];
  }

  const [expanded, setExpanded] = React.useState<string | false>("panel1");

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  const handleFolderSelect = (folderPaths: string[], files: string[]) => {
    console.log(folderPaths);
    const foldersWithFiles: FolderWithFiles[] = organizeFilesByFolder(folderPaths, files);
    console.log(foldersWithFiles);
  };

  const organizeFilesByFolder = (folderPaths: string[], files: string[]): FolderWithFiles[] => {
    const folders: FolderWithFiles[] = [];
    const mainFolder = findCommonPrefix(folderPaths);
    console.log(mainFolder);

    // Iterate through each folder path
    folderPaths.forEach((folderPath) => {
      // Filter files that belong to the current folder
      const filesInFolder = files.filter((file) => file.startsWith(folderPath));

      // Remove folder path from file names
      const formattedFiles = filesInFolder.map((file) => file.replace(`${folderPath}/`, ''));

      // Add folder with formatted files to the array
      folders.push({
        folderPath,
        files: formattedFiles,
      });
    });

    return folders;
  };

  // Function to find the common prefix among strings
  const findCommonPrefix = (strings: string[]): string => {
    if (!strings || strings.length === 0) {
      return '';
    }

    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (strings[i].indexOf(prefix) !== 0) {
        prefix = prefix.substring(0, prefix.length - 1);
      }
    }

    return prefix;
  };

  return (
    <Grid>
      ``
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography sx={{ width: "65%", flexShrink: 0 }}>
            Step-1 Enter your transfer informations
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SelectFolder onFolderSelect={handleFolderSelect} />

        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
        >
          <Typography sx={{ width: "65%", flexShrink: 0 }}>
            Step-2 Select folders to add to the Digital File List
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <DataGridDemo />
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}