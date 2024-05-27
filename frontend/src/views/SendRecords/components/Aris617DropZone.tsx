import DropZoneComponent from "../../../components/DropZoneComponent";

const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
};

const Aris617DropZone: React.FC = () => {
 
  return (
    <DropZoneComponent 
      accept={acceptedFileTypes}
      allowFolders={true}
      onFilesAccepted={(files) => {
        console.log(files);
      }}
    />
  );
};

export default Aris617DropZone;
