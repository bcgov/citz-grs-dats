import * as React from "react";
import { useCallback, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Aris66xDropZone from "./components/Aris66xDropZone";
import Aris617DropZone from "./components/Aris617DropZone";
import FoldersValidation from "./components/FoldersValidations";
import UploadService from "../../services/uploadService";

export default function SendRecords() {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [folders, setFolders] = useState<string[]>([]);

  const uploadService = new UploadService();

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  const handleValidation = () => {

    console.log("Validating folders");
  };
  const handle66xFileUpload = useCallback((file: File) => {
    const formData = new FormData();
    formData.append("uploadARIS66xfile", file);


    uploadService
      .upload66xFile(formData)
      .then((response) => {
        console.log(response);
        setFolders(response.folders || []);

      })
      .catch((error) => {
        console.error("Upload error:", error);
        // Handle the error as needed
      });
  }, []);

  const handle617FileUpload = useCallback((file: File) => {
    const formData = new FormData();
    formData.append("uploadARIS617file", file);

    // Assuming uploadService.upload66xFile returns a Promise
    uploadService
      .upload617File(formData)
      .then((response) => {
        console.log(response);
        // setFolders(response.folders || []);
        // Do any additional handling or state updates here
      })
      .catch((error) => {
        console.error("Upload error:", error);
        // Handle the error as needed
      });
  }, []);

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
            Upload your 66x Digital Data List Excel Sheets
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Aris66xDropZone handleFileUpload={handle66xFileUpload} />
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
            Validates the folders identified from the Digital File List (ARS
            66X)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FoldersValidation
            folders={folders}
            onValidation={handleValidation}
          />
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel3"}
        onChange={handleChange("panel3")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>Step - 3</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            uploads their approved Transfer form (ARS 617)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Aris617DropZone handleFileUpload={handle617FileUpload} />
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel4"}
        onChange={handleChange("panel4")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel4bh-content"
          id="panel4bh-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>Step - 4</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            View and Accept the Submission Agreement.
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer
            sit amet egestas eros, vitae egestas augue. Duis vel est augue.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel5"}
        onChange={handleChange("panel5")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel5bh-content"
          id="panel5bh-header"
        >
          <Typography sx={{ width: "33%", flexShrink: 0 }}>Step - 5</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Review and Confirmed the Records Importation
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Nunc vitae orci ultricies, auctor nunc in, volutpat nisl. Integer
            sit amet egestas eros, vitae egestas augue. Duis vel est augue.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}
