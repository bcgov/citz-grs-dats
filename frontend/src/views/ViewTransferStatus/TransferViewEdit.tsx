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
  MenuItem,
} from "@mui/material";

import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DoneTwoToneIcon from "@mui/icons-material/DoneTwoTone";
import { TransferService } from "../../services/transferService";
import ITransferDTO from "../../types/DTO/Interfaces/ITransferDTO";
import { TransferStatus } from "../../types/Enums/TransferStatus";

const TransferViewEdit: React.FC = () => {
  const { id } = useParams();
  const [transfer, setTransfer] = useState<ITransferDTO | any>(null);
  const [isTransferEditing, setIsTransferEditing] = useState(false);

  const transferService = new TransferService();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setTransfer({ ...transfer, [name!]: value });
  };

  const handleUpdateTransfer = async () => {
    try {
      await transferService.updateTransfer(transfer);
    } catch (error) {
      console.error("Error updating transfer:", error);
    }
  };

  const handleDeleteTransfer = async () => {
    try {
      await transferService.deleteTransfer(id);
    } catch (error) {
      console.error("Error deleting transfer:", error);
    }
  };

  const handleCreatePSP = async () => {
    // Logic for creating PSP goes here
    console.log("Logic for creating PSP goes here")
  };

  useEffect(() => {
    const fetchTransfer = async () => {
      if (id) {
        try {
          const transfer = await transferService.getTransfer(id);
          setTransfer(transfer);
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };

    fetchTransfer();
  }, [id]);

  if (!transfer) {
    return <div>Loading...</div>;
  }

  return (
    <>
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
            </Box>
            <Box>
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
              <Button
                variant="text"
                color="error"
                onClick={handleDeleteTransfer}
              >
                Delete Transfer
              </Button>
              <Button
                variant="text"
                color="primary"
                onClick={handleCreatePSP}
                disabled={transfer.transferStatus !== TransferStatus.TrComplete}
              >
                Create PSP
              </Button>
            </Box>
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
              sx={{ width: "20%", marginRight: "2%" }}
              name="accessionNumber"
              label="Accession Number"
              variant="outlined"
              onChange={handleInputChange}
              value={transfer.accessionNumber}
            />

            <TextField
              disabled={!isTransferEditing}
              sx={{ width: "20%" }}
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
                marginRight: 2,
                marginLeft: 2,
                marginBottom: 2,
              }}
              disabled={!isTransferEditing}
              label="Description"
              name="description"
              variant="outlined"
              onChange={handleInputChange}
              value={transfer.description}
            />
            <TextField
              id="outlined-select-currency"
              select
              label="Select"
              disabled={!isTransferEditing}
              onChange={handleInputChange}
              value={transfer.transferStatus}
            >
              {Object.values(TransferStatus).map((transferStatus) => (
                <MenuItem key={transferStatus} value={transferStatus}>
                  {transferStatus}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Card>
        <Card>
          <Box p={1} display="flex" alignItems="center">
            <Typography variant="h5" gutterBottom>
              Producer Informations
            </Typography>
          </Box>
          <Divider />
          <Grid
            container
            spacing={4}
            direction="row"
            sx={{ marginTop: 2, marginBottom: 2, marginLeft: 2 }}
          >
            <TextField
              disabled={!isTransferEditing}
              sx={{ width: "30%", marginRight: "2%" }}
              name="producerMinistry"
              label="Ministry"
              variant="outlined"
              onChange={handleInputChange}
              value={transfer.producerMinistry}
            />

            <TextField
              disabled={!isTransferEditing}
              sx={{ width: "30%" }}
              name="producerBranch"
              label="Branch"
              variant="outlined"
              onChange={handleInputChange}
              value={transfer.producerBranch}
            />
            <TextField
              disabled={!isTransferEditing}
              sx={{ width: "30%", marginLeft: 2 }}
              name="producerOfficeName"
              label="Office"
              variant="outlined"
              onChange={handleInputChange}
              value={transfer.producerOfficeName}
            />
          </Grid>
        </Card>
      </Grid>
    </>
  );
};

export default TransferViewEdit;
