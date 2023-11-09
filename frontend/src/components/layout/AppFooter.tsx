import React from "react";
import { CFooter } from "@coreui/react";

const AppFooter: React.FC = () => {
  return (
    <CFooter>
      <div>
        <a>Digital Archive Transfer Service (DATS)</a>
        <span className="ms-1">&copy; 2023 DA team.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a
          href="https://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/citizens-services/servicebc"
          target="_blank"
          rel="noopener noreferrer"
        >
          The best team from the CITZ-Service
        </a>
      </div>
    </CFooter>
  );
};

export default React.memo(AppFooter);
