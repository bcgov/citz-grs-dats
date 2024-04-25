import * as React from "react";
import { FormProps } from "react-router-dom";

export const ImportForm: React.FunctionComponent<FormProps> = (props) => {
const folderInput= React.useRef(null);

return (
<>
           <div className="form-group row">
              <div className="col-lg-6">
                <label>Select Folder</label>
              </div>
              <div className="col-lg-6">
                <input
                  type="file"  
                  directory=""
                  webkitdirectory=""                
                  className="form-control"
                  ref={folderInput}
                />
              </div>
            </div>
</>)
};

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extends React's HTMLAttributes
    directory?: string;        // remember to make these attributes optional....
    webkitdirectory?: string;
  }
}