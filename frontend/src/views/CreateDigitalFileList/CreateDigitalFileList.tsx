import DataGridDemo from "./components/DigitalfileListGrid"
import SelectFolder from "./components/SelectFolder"
import GenericStepper from "../../components/GenericStepper";
import { Card as MuiCard, CardContent, CardActions, Typography, Button } from '@mui/material';
export default function CreateDigitalFileList() {

  
const steps = [
  {label: 'Transfer informations', content: <SelectFolder />},
  {label: 'Select folders', content: <DataGridDemo />}
];
  return (
   <div>
        <Typography variant="h5" component="div">
        Transfer information
        </Typography>
        <SelectFolder />
        </div>
  );
}