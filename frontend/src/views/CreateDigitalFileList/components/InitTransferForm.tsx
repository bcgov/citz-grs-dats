import { FC, ReactElement } from "react";
import ITransferFormData from "../../../types/Interfaces/ITransferFormData";
import {
  Card,
  Divider,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DoneTwoToneIcon from "@mui/icons-material/DoneTwoTone";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import { TransferStatus } from "../../../types/Enums/TransferStatus";

interface InitTransferFormProps {
  transfer: ITransferFormData | any;
  isTransferEditing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (e: SelectChangeEvent) => void;
  onToggleTransferEditing: () => void;
}

const InitTransferForm: React.FC<InitTransferFormProps> = (props) => {
  // Destructure props
  const {
    transfer,
    isTransferEditing,
    onInputChange,
    onSelectChange,
    onToggleTransferEditing,
  } = props;

  return (
    <>
      <Grid container spacing={1}>
        <Card sx={{ width: "100%" }}>
          <Grid item xs={12} sx={{ marginBottom: 1 }}>
            {/* <Card> */}
            <Box
              p={1}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle2">Transfer details</Typography>
              </Box>
              {/* <Button
                variant="text"
                startIcon={
                  isTransferEditing ? <DoneTwoToneIcon /> : <EditTwoToneIcon />
                }
                onClick={onToggleTransferEditing}
              >
                {isTransferEditing ? "Done" : "Edit"}
              </Button> */}
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
                onChange={onInputChange}
                value={transfer.accessionNumber}
              />

              <TextField
                disabled={!isTransferEditing}
                sx={{ width: "20%" }} // Adjust width here
                name="applicationNumber"
                label="Application Number"
                variant="outlined"
                onChange={onInputChange}
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
                onChange={onInputChange}
                value={transfer.description}
              />
              <Select
                disabled={!isTransferEditing}
                sx={{ width: "20%" }}
                name="status"
                label="Status"
                variant="outlined"
                onChange={onSelectChange}
                value={transfer.status}
              >
                {Object.values(TransferStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            {/* </Card> */}
          </Grid>
          <Grid item xs={12}>
            {/* <Card> */}
            <Box
              p={1}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle2">
                  Producer Informations
                </Typography>
              </Box>
              {/* <Button
                variant="text"
                startIcon={
                  isProducerEditing ? <DoneTwoToneIcon /> : <EditTwoToneIcon />
                }
                onClick={onToggleTransferEditing}
              >
                {isProducerEditing ? "Done" : "Edit"}
              </Button> */}
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
                sx={{ width: "20%", marginRight: "2%" }} // Adjust width here
                name="agentLastName"
                label="Agent LastName"
                variant="outlined"
                onChange={onInputChange}
                value={transfer.agentLastName}
              />

              <TextField
                disabled={!isTransferEditing}
                sx={{ width: "20%" }} // Adjust width here
                name="agentFirstName"
                label="Agent FirstName"
                variant="outlined"
                onChange={onInputChange}
                value={transfer.agentFirstName}
              />
              <TextField
                disabled={!isTransferEditing}
                sx={{ width: "45%", marginLeft: 4 }} // Adjust width here
                name="agentEmail"
                label="Agent Email"
                variant="outlined"
                onChange={onInputChange}
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
                disabled={!isTransferEditing}
                sx={{ width: "30%", marginRight: "2%" }} // Adjust width here
                name="producerMinistry"
                label="Ministry"
                variant="outlined"
                onChange={onInputChange}
                value={transfer.producerMinistry}
              />

              <TextField
                disabled={!isTransferEditing}
                sx={{ width: "30%" }} // Adjust width here
                name="producerBranch"
                label="Branch"
                variant="outlined"
                onChange={onInputChange}
                value={transfer.producerBranch}
              />
              <TextField
                disabled={!isTransferEditing}
                sx={{ width: "30%", marginLeft: 2 }} // Adjust width here
                name="producerOfficeName"
                label="Office"
                variant="outlined"
                onChange={onInputChange}
                value={transfer.producerOfficeName}
              />
            </Grid>
            {/* </Card> */}
            <Divider />
            <Grid>
              <Box
                p={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle2">
                    Producer Informations
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={
                    isTransferEditing ? (
                      <FactCheckOutlinedIcon />
                    ) : (
                      <DoneTwoToneIcon />
                    )
                  }
                  onClick={onToggleTransferEditing}
                >
                  {isTransferEditing ? "Validation" : "Done"}
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    isTransferEditing ? (
                      <FactCheckOutlinedIcon />
                    ) : (
                      <DoneTwoToneIcon />
                    )
                  }
                  onClick={onToggleTransferEditing}
                >
                  {isTransferEditing ? "Validation" : "Done"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </>
  );
};

export default InitTransferForm;
