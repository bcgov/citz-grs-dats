import React, { useState, useEffect } from "react";
import {
  Card,
  Divider,
  Typography,
  Box,
  Button,
  Grid,
  Container,
  Paper,
  TextField,
  Modal,
  FormHelperText,
  CardContent,
} from "@mui/material";
import { TransferService } from "../../../services/transferService";

import ITransferFormData from "../../../types/Interfaces/ITransferFormData";
import { TransferStatus as status } from "dats_shared/Types/Enums/TransferStatus";

interface CreateTransferModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const CreateTransferModal: React.FC<CreateTransferModalProps> = ({
  isOpen,
  onRequestClose,
}) => {
  const transferService = new TransferService();
  const [transfer, setTransfer] = useState<ITransferFormData>({
    accessionNumber: "",
    applicationNumber: "",
    description: "",
    // status: status new ,
    descriptionOfRecords: "",
    agentLastName: "",
    agentFirstName: "",
    agentEmail: "",
    producerOfficeName: "",
    producerMinistry: "Attorney General",
    producerBranch: "Legal Services Branch",
    producerOfficeAddress: "",
    producerOfficeCity: "",
    producerOfficePostalCode: "",
  });

  const [visible, setVisible] = useState(isOpen); // Initialize the state based on the prop
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    setVisible(isOpen); // Update the state when the prop changes
  }, [isOpen]);

  const handleCreateTransfer = async () => {
    try {
      // Create a new transfer using the TransferService
      console.log("handleCreateTransfer");
      console.log(transfer);

      await transferService.createTransfer(transfer);
      // Close the modal
      setVisible(false);
      onRequestClose();
    } catch (error) {
      console.error("Error creating transfer:", error);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransfer({ ...transfer, [name]: value });
    console.log(name + ":" + value);
  };
  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid container spacing={1}>
          <Paper>
            <Grid item xs={12} sx={{ marginBottom: 2 }}>
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
                  <Button color="primary" onClick={handleCreateTransfer}>
                    Save changes
                  </Button>
                </Box>
                <Divider />
                <Grid
                  container
                  spacing={1}
                  direction="row"
                  sx={{ marginTop: 2, marginBottom: 2, marginLeft: 2 }}
                >
                  <TextField
                    sx={{ width: "20%", marginRight: "2%" }} // Adjust width here
                    name="accessionNumber"
                    label="Accession Number"
                    variant="outlined"
                    onChange={handleInputChange}
                    value={transfer.accessionNumber}
                  />

                  <TextField
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
                    label="Description"
                    name="description"
                    variant="outlined"
                    onChange={handleInputChange}
                    value={transfer.description}
                  />
                  <TextField
                    sx={{ marginLeft: 2, marginBottom: 2, width: "20%" }}
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
                  <Button>Edit</Button>
                </Box>
                <Divider />

                <Grid
                  container
                  spacing={4}
                  direction="row"
                  sx={{ marginTop: 2, marginBottom: 2, marginLeft: 2 }}
                >
                  <TextField
                    sx={{ width: "20%", marginRight: "2%" }} // Adjust width here
                    name="agentLastName"
                    label="Agent LastName"
                    variant="outlined"
                    onChange={handleInputChange}
                    value={transfer.agentLastName}
                  />

                  <TextField
                    sx={{ width: "20%" }} // Adjust width here
                    name="agentFirstName"
                    label="Agent FirstName"
                    variant="outlined"
                    onChange={handleInputChange}
                    value={transfer.agentFirstName}
                  />
                  <TextField
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
                    sx={{ width: "30%", marginRight: "2%" }} // Adjust width here
                    name="producerMinistry"
                    label="Ministry"
                    variant="outlined"
                    onChange={handleInputChange}
                    value={transfer.producerMinistry}
                  />

                  <TextField
                    sx={{ width: "30%" }} // Adjust width here
                    name="producerBranch"
                    label="Branch"
                    variant="outlined"
                    onChange={handleInputChange}
                    value={transfer.producerBranch}
                  />
                  <TextField
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
          </Paper>
        </Grid>
      </Modal>
    </div>
  );
};

export default CreateTransferModal;
