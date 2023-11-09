import React, { useState, useEffect } from "react";
import FolderSelector from "./components/Upload/FolderSelector";
import {
  GetMetadataForFiles,
  FileMetadata,
} from "./components/Upload/GetMetadataForFiles";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from "@coreui/react";

function UploadeDigitalFileListForm() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata[]>([]);

  const handleFolderSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  useEffect(() => {
    if (selectedFiles.length > 0) {
      // Call the function to get metadata for the selected files
      GetMetadataForFiles(selectedFiles).then(
        (metadata: React.SetStateAction<FileMetadata[]>) => {
          setFileMetadata(metadata);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  return (
    <CRow>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Create Digital File List</strong>
        </CCardHeader>
        <CCardBody>
          <div>
            <FolderSelector onFolderSelect={handleFolderSelect} />
            <h2>Selected Files with Metadata</h2>
            <ul>
              {fileMetadata.map((metadata, index) => (
                //  <li key={index}></li>
                <CAccordion>
                  <CAccordionItem itemKey={index}>
                    <CAccordionHeader>{metadata.name}</CAccordionHeader>
                    <CAccordionBody>
                      <br />
                      <strong>Size:</strong> {metadata.size} bytes
                      <br />
                      <strong>Type:</strong> {metadata.type}
                      <br />
                      <strong>Checksum MD5 :</strong> {metadata.checksum_MD5}
                      <br />
                      <strong>Checksum SHA1:</strong> {metadata.checksum_SHA1}
                      <br />
                      <strong>Checksum SHA256 :</strong>{" "}
                      {metadata.checksum_SHA256}
                      <br />
                      <strong>Checksum SHA512:</strong>{" "}
                      {metadata.checksum_SHA512}
                      <br />
                    </CAccordionBody>
                  </CAccordionItem>
                </CAccordion>
              ))}
            </ul>
          </div>
        </CCardBody>
      </CCard>
    </CRow>
  );
}

export default UploadeDigitalFileListForm;
