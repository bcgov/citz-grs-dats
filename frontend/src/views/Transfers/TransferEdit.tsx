import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CCol,
  CForm,
  CRow,
  CButton,
} from "@coreui/react";
import { TransferService } from "../../services/transferService";
import ITransferFormData from "../../types/Interfaces/ITransferFormData";
//import { ITransfer } from "dats_shared/Types/interfaces/ITransfer";
//import TransferForm from "../Transfers/components/TransferForm";

const TransferEdit: React.FC = () => {
  const { transferId } = useParams();
  const [transfer, setTransfer] = useState<ITransferFormData | any>(null);
  const transferService = new TransferService();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransfer({ ...transfer, [name]: value });
    console.log(name + ":" + value);
  };

  const handleUpdateTransfer = async () => {
    try {
      // Create a new transfer using the TransferService
      console.log("handleUpdateTransfer");
      console.log(transfer);

      await transferService.updateTransfer(transfer);
      // setIsReadonly(true);
    } catch (error) {
      console.error("Error updating transfer:", error);
    }
  };

  useEffect(() => {
    const fetchTransfer = async () => {
      if (transferId) {
        try {
          const transfer = await transferService.getTransfer(transferId);
          setTransfer(transfer);
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };

    fetchTransfer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferId]);

  if (!transfer) {
    return <div>Loading...</div>;
  }
  console.log(transfer);
  return (
    <CRow>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Transfer Details</strong>
        </CCardHeader>
        <CCardBody>
          <CForm className="row g-3">
            <CCol md={3}>
              <CFormInput
                type="text"
                name="accessionNumber"
                value={transfer.accessionNumber}
                onChange={handleInputChange}
                label="Accession  Number"
              />
            </CCol>
            <CCol md={3}>
              <CFormInput
                type="text"
                name="applicationNumber"
                value={transfer.applicationNumber}
                onChange={handleInputChange}
                label="Application Number"
              />
            </CCol>
            <CRow>
              <CCol xs={6}>
                <CFormInput
                  type="text"
                  id="description"
                  value={transfer.description}
                  onChange={handleInputChange}
                  label="Description"
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="text"
                  name="scheduleNumber"
                  value={transfer.scheduleNumber}
                  onChange={handleInputChange}
                  label="schedule Number"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol xs={6}>
                <CFormInput
                  type="text"
                  name="producerMinistry"
                  value={transfer.producerMinistry}
                  onChange={handleInputChange}
                  label="Producer Ministry"
                />
              </CCol>
              <CCol xs={6}>
                <CFormInput
                  type="text"
                  name="producerBranch"
                  value={transfer.producerBranch}
                  onChange={handleInputChange}
                  label="Producer Branch"
                />
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
        {/* <CButton
          color="primary"
          variant="ghost"
          onClick={() => setIsReadonly((prevState) => !prevState)}
        >
          Edit
        </CButton> */}
        <CButton color="primary" variant="ghost" onClick={handleUpdateTransfer}>
          Save
        </CButton>
      </CCard>
    </CRow>
  );
};

export default TransferEdit;
