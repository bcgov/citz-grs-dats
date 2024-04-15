import React from "react";
import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DigitalfileListGrid from "./components/DigitalFileGrid"

export default function CreateDigitalFileList() {
    const [data, setData] = useState([]);
    
    const [expanded, setExpanded] = React.useState<string | false>("panel1");
    
    const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
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
              {/* <InitTransferForm
                transfer={transfer}
                isTransferEditing={isTransferEditing}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                onToggleTransferEditing={handleToggleTransferEditing}
              /> */}
              add transfer ?
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
            <DigitalfileListGrid />
              {/* <DigitalfileListGrid
                initialRows={data}
                onSaveClick={handleSaveClick}
                onDeleteClick={handleDeleteClick}
                onProcessRowUpdate={handleProcessRowUpdate}
              /> */}
            </AccordionDetails>
          </Accordion>
        </Grid>
      );
}