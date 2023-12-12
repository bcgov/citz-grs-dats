import * as React from "react";
import { FC, useCallback, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Chip, Link as MuiLink, emphasize, styled } from "@mui/material/";
import { Link, Link as RouterLink } from "react-router-dom";

import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/material";
import SelectFolder from "./components/SelectFolder";
import FileUploadComponent from "../../components/FileUploadComponent";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
}) as typeof Chip; // TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591

function handleClick(event: React.MouseEvent<Element, MouseEvent>) {
  event.preventDefault();
  console.log("You clicked a breadcrumb.");
}
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
      {/* Breadcrumb
      <Box p={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <StyledBreadcrumb
            component="a"
            href="#"
            label="Home"
            icon={<HomeIcon fontSize="small" />}
          />
          <StyledBreadcrumb component="a" href="#" label="Catalog" />
          <StyledBreadcrumb
            label="Accessories"
            deleteIcon={<ExpandMoreIcon />}
            onDelete={handleClick}
            onClick={handleClick}
          />
        </Breadcrumbs>
      </Box> */}
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
