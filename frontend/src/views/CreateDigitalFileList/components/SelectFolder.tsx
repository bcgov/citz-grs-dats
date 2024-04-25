import React, { FC, ReactElement, useRef, useState } from "react";
// import calculateHash from "../../../utils/calculateHash";

interface SelectFolderProps {
  onFolderSelect: (folderPaths: string[], files: string[]) => void;
}

interface FileListProps {
  files: string[];
}

const FileList: FC<FileListProps> = ({ files }): ReactElement => {
  return (
    <div>
      <h3>Files in Selected Folders:</h3>
      <ul>
        {files.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
      </ul>
    </div>
  );
};

const SelectFolder: FC<SelectFolderProps> = ({
  onFolderSelect,
}): ReactElement => {
  const folderInput = useRef<HTMLInputElement>(null);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const folderPaths: string[] = [];
      const fileList: string[] = [];

      Array.from(files).forEach((file) => {
        const folderPath = file.webkitRelativePath
          ? file.webkitRelativePath.split("/").slice(0, -1).join("/")
          : undefined;

        if (folderPath && !folderPaths.includes(folderPath)) {
          folderPaths.push(folderPath);
        }
        // const filePathWhitFile = folderPath + "/" + file.name
        // const sha256HashPromise = calculateHash(filePathWhitFile, 'sha256');
        fileList.push(folderPath + "/" + file.name);
      });

      setSelectedFolders(folderPaths);
      setSelectedFiles(fileList);
      onFolderSelect(folderPaths, fileList);
    }
  };

  const supportsDirectoryAttribute =
    typeof document.createElement("input").webkitdirectory !== "undefined";

  return (
    <div>
      <FileList files={selectedFiles} />
      <label htmlFor="folderInput">
        Select Folder
        <input
          id="folderInput"
          type="file"
          onChange={handleFolderSelect}
          className="form-control"
          ref={(folderInput as unknown) as React.RefObject<HTMLInputElement>}
          multiple
          // @ts-ignore
          directory={supportsDirectoryAttribute ? "" : undefined}
          // @ts-ignore
          webkitdirectory={supportsDirectoryAttribute ? "" : undefined}
        />
      </label>
    </div>
  );
};

export default SelectFolder;
