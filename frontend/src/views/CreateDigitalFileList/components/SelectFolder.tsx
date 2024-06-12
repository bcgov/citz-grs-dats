import React, { FC, ReactElement, useRef, useState } from "react";
// import calculateHash from "../../../utils/calculateHash";

interface SelectFolderProps {
  
}

interface FileListProps {
  files: string[];
}
interface FolderWithFiles {
  folderPath: string;
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
  const openDesktopApp = (browseType: string) => {
    window.location.href = `citz-grs-dats://open?browse=${browseType}`;
};
  const onFolderSelect = (folderPaths: string[], files: string[]) => {
    console.log(folderPaths);
    const foldersWithFiles: FolderWithFiles[] = organizeFilesByFolder(folderPaths, files);
    console.log(foldersWithFiles);
  };

  const organizeFilesByFolder = (folderPaths: string[], files: string[]): FolderWithFiles[] => {
    const folders: FolderWithFiles[] = [];
    const mainFolder = findCommonPrefix(folderPaths);
    console.log(mainFolder);

    // Iterate through each folder path
    folderPaths.forEach((folderPath) => {
      // Filter files that belong to the current folder
      const filesInFolder = files.filter((file) => file.startsWith(folderPath));

      // Remove folder path from file names
      const formattedFiles = filesInFolder.map((file) => file.replace(`${folderPath}/`, ''));

      // Add folder with formatted files to the array
      folders.push({
        folderPath,
        files: formattedFiles,
      });
    });

    return folders;
  };

  // Function to find the common prefix among strings
  const findCommonPrefix = (strings: string[]): string => {
    if (!strings || strings.length === 0) {
      return '';
    }

    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (strings[i].indexOf(prefix) !== 0) {
        prefix = prefix.substring(0, prefix.length - 1);
      }
    }

    return prefix;
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
      <button onClick={() => openDesktopApp('folder')}>Open Folder Browser</button>
            <button onClick={() => openDesktopApp('file')}>Open File Browser</button>
            <button onClick={() => openDesktopApp('singlefolder')}>Open Single Folder Browser</button>
            <button onClick={() => openDesktopApp('singlefile')}>Open Single File Browser</button>

    </div>
  );
};

export default SelectFolder;
