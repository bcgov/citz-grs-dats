import React, { FC, ReactElement, useRef, useState } from "react";

interface SelectFolderProps {
  onFolderSelect: (folderPath: string, files: string[]) => void;
}

interface FileListProps {
  files: string[];
}

const FileList: FC<FileListProps> = ({ files }): ReactElement => {
  return (
    <div>
      <h3>Files in Selected Folder:</h3>
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
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const folderPath = files[0].webkitRelativePath
        ? files[0].webkitRelativePath.split("/").slice(0, -1).join("/")
        : undefined;

      if (folderPath) {
        const fileList = Array.from(files).map((file) => file.name);
        onFolderSelect(folderPath, fileList);
        setSelectedFiles(fileList);
      }
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
          directory={supportsDirectoryAttribute ? "" : undefined}
          webkitdirectory={supportsDirectoryAttribute ? "" : undefined}
          className="form-control"
          ref={folderInput}
        />
      </label>
    </div>
  );
};
declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extends React's HTMLAttributes
    directory?: string; // remember to make these attributes optional....
    webkitdirectory?: string;
  }
}
export default SelectFolder;

// declare module "react" {
//   interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
//     // extends React's HTMLAttributes
//     directory?: string; // remember to make these attributes optional....
//     webkitdirectory?: string;
//   }
// }

// import * as React from "react";
// import { FormProps } from "react-router-dom";

// export const SelectFolder: React.FunctionComponent<FormProps> = (props) => {
//   const folderInput = React.useRef(null);

//   return (
//     <>
//       <div className="form-group row">
//         <div className="col-lg-6">
//           <label>Select Folder</label>
//         </div>
//         <div className="col-lg-6">
//           <input
//             type="file"
//             directory=""
//             webkitdirectory=""
//             className="form-control"
//             ref={folderInput}
//           />
//         </div>
//       </div>
//     </>
//   );
// };
