import DataGridDemo from "./components/DigitalfileListGrid"
import SelectFolder from "./components/SelectFolder"
import GenericStepper from "../../components/GenericStepper";

export default function CreateDigitalFileList() {

  
const steps = [
  {label: 'Transfer informations', content: <SelectFolder />},
  {label: 'Select folders', content: <DataGridDemo />}
];
  return (
    <GenericStepper steps={steps} />
  );
}