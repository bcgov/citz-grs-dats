
import React, { ReactNode } from 'react';

interface RowProps {
  children: ReactNode;
}


const DigitalFileRow: React.FC<RowProps> = ({ children }) => {
    return (
      <div className="row">
        {children}
      </div>
    );
  }
  
  export default DigitalFileRow;