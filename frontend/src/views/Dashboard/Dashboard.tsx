import React from "react";
import { NavLink } from "react-router-dom";
import {
  CContainer,
  CRow,
  CCard,
  CCardBody,
  CCardTitle,
  CCol,
  CCardText,
  CButton,
} from "@coreui/react";

const Dashboard: React.FC = () => {
  return (
    <CContainer fluid>
      <CRow>
        <CCol sm={3}>
          <CCard style={{ width: "18rem" }}>
            <CCardBody>
              <CCardTitle>Create Digital File List</CCardTitle>
              <CCardText>
                producer can use DATS functionality "create a digital file list"
                to generate a File List with the extraction of metadata
                information into a report.
              </CCardText>
              <NavLink to="/UploadDigitalFileList/UploadDigitalFileListForm">
                <CButton href="#">Start Create Digital File List</CButton>
              </NavLink>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={3}>
          <CCard style={{ width: "18rem" }}>
            <CCardBody>
              <CCardTitle>Send Digital Records</CCardTitle>
              <CCardText>
                Transfer FR Digital Records to GRS team. all informations will
                be stored in DATS
              </CCardText>
              <CButton href="#">Start the Transfer</CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={3}>
          <CCard style={{ width: "18rem" }}>
            <CCardBody>
              <CCardTitle>Create structured PSPs</CCardTitle>
              <CCardText>
                Create PSP for the Transfer received from Producer. The
                structureed PSPs will be create in the DA Folder
              </CCardText>
              <CButton href="#">Start the PSP Creation</CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={3}>
          <CCard style={{ width: "18rem" }}>
            <CCardBody>
              <CCardTitle>See Transfers in Storage</CCardTitle>
              <CCardText>
                Archivist can see the information on PSPs processed and created
                by DATS in order to process the accession and create the SIP.
              </CCardText>
              <NavLink to="/transfers">
                <CButton href="#">See Transfers in Storage</CButton>
              </NavLink>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow xs={{ gutterY: 15 }}>
        <CCol sm={3}>
          <CCard style={{ width: "18rem" }}>
            <CCardBody>
              <CCardTitle>Request assistance on DATS</CCardTitle>
              <CCardText>Request assistance on DATS</CCardText>
              <CButton href="#">Request assistance</CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default Dashboard;
