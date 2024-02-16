import * as React from "react";
import { FC, useCallback, useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import { Alert, SelectChangeEvent } from "@mui/material/";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DigitalfileListGrid from "./components/DigitalfileListGrid";
import InitTransferForm from "./components/InitTransferForm";
import { TransferService } from "../../services/transferService";
import { GridRowId } from "@mui/x-data-grid";
import { ITransfer } from "dats_shared/Types/interfaces/ITransfer";
import { TransferStatus } from "../../types/Enums/TransferStatus";

import { Types, ObjectId } from "mongoose";
import { IDigitalFileList } from "dats_shared/Types/interfaces/IDigitalFileList";

export default function CreateDigitalFileList() {
  const [data, setData] = useState([]);

  const [transfer, setTransfer] = useState<ITransfer>({
    _id: new Types.ObjectId(),
    accessionNumber: "",
    applicationNumber: "",
    description: "",
    transferStatus: TransferStatus.Draft,
    producerMinistry: "",
    producerBranch: "",
    digitalFileLists: undefined,
    createDate: undefined,
    updatedDate: undefined,
    createdBy: "",
    updatedBy: "",
    timestamps: {},
  });

  // const [newTransfer, setNewTransfer] = useState<any>({});
  const [isTransferEditing, setIsTransferEditing] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const transferService = new TransferService();
  //setIsTransferEditing(true);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const result = await transferService.getDigitalFileListsFromTransfer(
  //         "65135928f00793fec8a5d525"
  //       );
  //       // Add an 'id' property to each item in the result array
  //       const dataWithGridId = result.map((item: any, index: number) => ({
  //         ...item,
  //         id: index + 1, // You can adjust the logic for generating IDs as needed
  //       }));
  //       console.log("dataWithId : ", dataWithGridId);
  //       setData(dataWithGridId);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchData();
  // }, [transferService]);
  //

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransfer({ ...transfer, [name]: value });
    console.log(name + ":" + value);
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target as HTMLSelectElement;
    setTransfer({ ...transfer, [name]: value });
    console.log(name + ":" + value);
  };
  const handleCreateTransfer = async () => {
    try {
      const newTransfer = await transferService.createTransfer(transfer);
      setTransfer(newTransfer);
      console.log(newTransfer);
    } catch (error) {
      console.error("Error updating transfer:", error);
    }
  };
  const handleUpdateTransfer = async () => {
    try {
      const upTransfer = await transferService.updateTransfer(transfer);
      console.log(upTransfer);
    } catch (error) {
      console.error("Error updating transfer:", error);
    }
  };
  const handleToggleTransferEditing = () => {
    if (isTransferEditing) {
      if (transfer._id) {
        handleUpdateTransfer();
      }
      //  handleCreateTransfer();
      handleCreateTransfer();
    }
    //setTransfer({ ...transfer, isNew: false });
    console.log(transfer);
    setIsTransferEditing(!isTransferEditing);
  };

  const handleSaveClick = (id: GridRowId) => {
    // Find the corresponding row data based on the id
    const selectedRow = data.find((row) => (row as { id: number }).id === id);
    console.log("selectedRow on  handleSaveClick id :", id);
    console.log("selectedRow on  handleSaveClick :", selectedRow);
    if (selectedRow) {
      // Access the _id property

      const { _id } = selectedRow;
      console.log(`Save clicked for row with ID: ${id}, _id: ${_id}`);
    }
  };

  const handleDeleteClick = async (id: GridRowId) => {
    // Handle delete logic
    const rowToDelete = data.find((row) => (row as { id: number }).id === id);

    if (rowToDelete) {
      const { _id } = rowToDelete;
      const deleteResult = await transferService.deleteDigitalFileList(
        "65135928f00793fec8a5d525",
        _id
      );
      console.log(`Delete clicked for row with ID: ${_id}`);
      console.log(deleteResult);
    }
  };

  const handleProcessRowUpdate = async (newRow: any) => {
    if (newRow.isNew) {
      const createResult = await transferService.createDigitalFileList(
        "65135928f00793fec8a5d525",
        newRow
      );
      <Alert severity="success">This is a success alert — check it out!</Alert>;
      console.log("Row to create:", createResult);
    } else {
      const updateResult = await transferService.updateDigitalFileList(
        "65135928f00793fec8a5d525",
        newRow._id,
        newRow
      );
      <Alert severity="success">This is a success alert — check it out!</Alert>;
      console.log("Row to update result:", updateResult);
    }
    console.log("Row updated:", newRow);
  };

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
          <InitTransferForm
            transfer={transfer}
            isTransferEditing={isTransferEditing}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onToggleTransferEditing={handleToggleTransferEditing}
          />
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
          <DigitalfileListGrid
            initialRows={data}
            onSaveClick={handleSaveClick}
            onDeleteClick={handleDeleteClick}
            onProcessRowUpdate={handleProcessRowUpdate}
          />
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}
