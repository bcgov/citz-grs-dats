import * as React from "react";
import { FC, useCallback, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/material";
import SelectFolder from "./components/SelectFolder";
import FileUploadComponent from "../../components/FileUploadComponent";

export default function CreateDigitalFileList() {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  const handleFolderSelect = (folderPath: string) => {
    console.log(`Selected Folder: ${folderPath}`);
    // Perform any additional actions with the selected folder path
  };
  return (
    <Grid>
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>Step - 1</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Step-1 Select folders to add to the Digital File List
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
          <Typography sx={{ width: "33%", flexShrink: 0 }}>Step - 2</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Step-2 Review and Download the newly created Digital File List
          </Typography>
        </AccordionSummary>
        <AccordionDetails>step -2</AccordionDetails>
      </Accordion>
    </Grid>
  );
}
