import { CFormInput } from "@coreui/react";
import React, { ChangeEvent } from "react";

interface FolderSelectorProps {
  onFolderSelect: (files: File[]) => void;
}

function FolderSelector({ onFolderSelect }: FolderSelectorProps) {
  const handleFolderSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;

    if (selectedFiles) {
      const fileList = Array.from(selectedFiles);
      onFolderSelect(fileList);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <CFormInput
          type="file"
          onChange={handleFolderSelect}
          {...({ webkitdirectory: "true" } as any)}
          directory=""
          multiple
        />
      </div>
    </div>
  );
}

export default FolderSelector;
