import axios from "axios";
import { Aris66UploadResponse } from "../types/DTO/Interfaces/Aris66UploadResponse"
const API_URL = `/api`; // Replace with your API endpoint URL

export default class UploadService {
  public async upload66xFile(formData: any): Promise<Aris66UploadResponse> {
    return await axios
      .post(`${API_URL}/api/uploadfileARIS66x`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        // const jsonString = JSON.stringify(jsonResponse);
        // const resTest: Aris66UploadResponse = JSON.parse(jsonString);
        // return resTest;
        return response.data;
      });
  }
  public async uploadDataportFile(formData: any): Promise<Aris66UploadResponse> {
    return await axios
      .post(`${API_URL}/api/uploadDataportFile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        // const jsonString = JSON.stringify(jsonResponse);
        // const resTest: Aris66UploadResponse = JSON.parse(jsonString);
        // return resTest;
        return response.data;
      });
  }

  public async get66xFileTransferInfos(formData: any): Promise<any> {
    return await axios
      .post(`${API_URL}/api/get66xFileTransferInfos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async upload617File(formData: any): Promise<any> {
    return await axios
      .post(`${API_URL}/api/uploadfileARIS617`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async uploadFileToDocumentation(formData: any): Promise<any> {
    return await axios
      .post(`${API_URL}/api/uploadFilesToS3Documentation`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async saveAgreementToDats(agreementText: Array<any>, applicationNumber: string, accessionNumber: string, userDisplayName: string, formattedDate: string, status: string, decision: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/api/submitAgreement`, {
        agreementText,
        applicationNumber,
        accessionNumber,
        userDisplayName,
        formattedDate,
        status,
        decision
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting agreement:', error);
      throw error;
    }
  }

  public async getUpdateAris662(accessionNumber: string, applicationNumber: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/api/downloadUpdateAris662`, {
        params: {
          accessionNumber,
          applicationNumber
        },
        headers: {
          "Content-Type": "application/json",
        },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Error making GET request to downloadUpdateAris662 :`, error);
      throw error;
    }
  }
}
