import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Divider,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
} from "@mui/material";

import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DoneTwoToneIcon from "@mui/icons-material/DoneTwoTone";
import { TransferService } from "../../services/transferService";
import ITransferDTO from "../../types/DTO/Interfaces/ITransferDTO";
//import { ITransfer } from "dats_shared/Types/interfaces/ITransfer";
//import TransferForm from "../Transfers/components/TransferForm";

const TransferViewEdit: React.FC = () => {
  const { transferId } = useParams();
  const [transfer, setTransfer] = useState<ITransferDTO | any>(null);
  const [isTransferEditing, setIsTransferEditing] = useState(false);
  const [isProducerEditing, setIsProducerEditing] = useState(false);

  const transferService = new TransferService();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransfer({ ...transfer, [name]: value });
    console.log(name + ":" + value);
  };

  const handleUpdateTransfer = async () => {
    try {
      await transferService.updateTransfer(transfer);
      // setIsReadonly(true);
    } catch (error) {
      console.error("Error updating transfer:", error);
    }
  };

  useEffect(() => {
    const fetchTransfer = async () => {
      if (transferId) {
        try {
          const transfer = await transferService.getTransfer(transferId);
          setTransfer(transfer);
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };

    fetchTransfer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferId]);

  if (!transfer) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12} sx={{ marginBottom: 1 }}>
          <Card>
            <Box
              p={1}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h5" gutterBottom>
                  Transfer Informations
                </Typography>
                <Typography variant="subtitle2">
                  Manage informations related to your Transfer details
                </Typography>
              </Box>
              <Button
                variant="text"
                startIcon={
                  isTransferEditing ? <DoneTwoToneIcon /> : <EditTwoToneIcon />
                }
                onClick={() => {
                  if (isTransferEditing) {
                    handleUpdateTransfer();
                  }
                  setIsTransferEditing(!isTransferEditing);
                }}
              >
                {isTransferEditing ? "Done" : "Edit"}
              </Button>
            </Box>
            <Divider />
            <Grid
              container
              spacing={1}
              direction="row"
              sx={{ marginTop: 1, marginBottom: 2, marginLeft: 2 }}
            >
              <TextField
                disabled={!isTransferEditing}
                sx={{ width: "20%", marginRight: "2%" }} // Adjust width here
                name="accessionNumber"
                label="Accession Number"
                variant="outlined"
                onChange={handleInputChange}
                value={transfer.accessionNumber}
              />

              <TextField
                disabled={!isTransferEditing}
                sx={{ width: "20%" }} // Adjust width here
                name="applicationNumber"
                label="Application Number"
                variant="outlined"
                onChange={handleInputChange}
                value={transfer.applicationNumber}
              />
            </Grid>
            <Grid>
              <TextField
                sx={{
                  width: "50%",
                  // marginTop: 2,
                  marginRight: 2,
                  marginLeft: 2,
                  marginBottom: 2,
                }} // Set width to 100%
                disabled={!isTransferEditing}
                label="Description"
                name="description"
                variant="outlined"
                onChange={handleInputChange}
                value={transfer.description}
              />
              <TextField
                sx={{ marginLeft: 2, marginBottom: 2, width: "20%" }}
                disabled={!isTransferEditing}
                name="status"
                label="Status"
                variant="outlined"
                onChange={handleInputChange}
                value={transfer.status}
              />
            </Grid>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <Box
              p={1}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h5" gutterBottom>
                  Producer Informations
                </Typography>
                <Typography variant="subtitle2">
                  Manage details related the Producer of the transfer
                </Typography>
              </Box>
              <Button
                variant="text"
                startIcon={
                  isProducerEditing ? <DoneTwoToneIcon /> : <EditTwoToneIcon />
                }
                onClick={() => {
                  if (isProducerEditing) {
                    handleUpdateTransfer();
                  }
                  setIsProducerEditing(!isProducerEditing);
                }}
              >
                {isProducerEditing ? "Done" : "Edit"}
              </Button>
            </Box>
            <Divider />

            <Grid
              container
              spacing={4}
              direction="row"
              sx={{ marginTop: 2, marginBottom: 2, marginLeft: 2 }}
            >
              <TextField
                disabled={!isProducerEditing}
                sx={{ width: "20%", marginRight: "2%" }} // Adjust width here
                name="agentLastName"
                label="Agent LastName"
                variant="outlined"
                onChange={handleInputChange}
                value={transfer.agentLastName}
              />

              <TextField
                disabled={!isProducerEditing}
                sx={{ width: "20%" }} // Adjust width here
                name="agentFirstName"
                label="Agent FirstName"
                variant="outlined"
                onChange={handleInputChange}
                value={transfer.agentFirstName}
              />
              <TextField
                disabled={!isProducerEditing}
                sx={{ width: "45%", marginLeft: 4 }} // Adjust width here
                name="agentEmail"
                label="Agent Email"
                variant="outlined"
                onChange={handleInputChange}
                value={transfer.agentEmail}
              />
            </Grid>
            <Grid
              container
              spacing={4}
              direction="row"
              sx={{ marginTop: 2, marginBottom: 2, marginLeft: 2 }}
            >
              <TextField
                disabled={!isProducerEditing}
                sx={{ width: "30%", marginRight: "2%" }} // Adjust width here
                name="producerMinistry"
                label="Ministry"
                variant="outlined"
                onChange={handleInputChange}
                value={transfer.producerMinistry}
              />

              <TextField
                disabled={!isProducerEditing}
                sx={{ width: "30%" }} // Adjust width here
                name="producerBranch"
                label="Branch"
                variant="outlined"
                onChange={handleInputChange}
                value={transfer.producerBranch}
              />
              <TextField
                disabled={!isProducerEditing}
                sx={{ width: "30%", marginLeft: 2 }} // Adjust width here
                name="producerOfficeName"
                label="Office"
                variant="outlined"
                onChange={handleInputChange}
                value={transfer.producerOfficeName}
              />
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default TransferViewEdit;
