import { useState } from "react";
import DropZoneComponent from "../../../components/DropZoneComponent";
import { extractExcelData, ExcelData } from "../../../utils/xlsxUtils";
const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
};

const Aris617DropZone: React.FC = () => {
  const [data, setData] = useState<ExcelData[]>([]);

  return (
    <DropZoneComponent 
      accept={acceptedFileTypes}
      allowFolders={true}
      onFilesAccepted={async (files) => {
        const file = files[0];
    if (file) {
      try {
        const extractedData = await extractExcelData(file);
        //setData(extractedData);
      } catch (error) {
        console.error(error);
      }
    }
      }}
    />
  );
};

export default Aris617DropZone;
