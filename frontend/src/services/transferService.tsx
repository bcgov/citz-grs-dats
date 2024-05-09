import axios from "axios";
import ITransferDTO from "../types/DTO/Interfaces/ITransferDTO";
import { IDigitalFileListDTO } from "../types/DTO/Interfaces/IDigitalFileListDTO";

const API_URL = "http://localhost:5000/api"; // Replace with your API endpoint URL

export class TransferService {
  public async getTransfers(): Promise<ITransferDTO[]> {
    return await axios
      .get<ITransferDTO[]>(`${API_URL}/transfers`)
      .then((response) => {
        const transfers: ITransferDTO[] = response.data;
        return transfers;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async getTransfer(transferId: string): Promise<ITransferDTO> {
    return await axios
      .get<ITransferDTO>(`${API_URL}/transfers/${transferId}`)
      .then((response) => {
        const transfer: ITransferDTO = response.data;
        return transfer;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async createTransfer(data: any): Promise<ITransferDTO> {
    return await axios
      .post(`${API_URL}/transfers`, data)
      .then((response) => {
        const transfer: ITransferDTO = response.data;
        return transfer;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async deleteTransfer(transferID: any): Promise<any> {
    return await axios
      .delete<ITransferDTO[]>(`${API_URL}/transfers/${transferID}`)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async updateTransfer(transfer: any): Promise<ITransferDTO[]> {
    return await axios
      .put<ITransferDTO[]>(`${API_URL}/transfers/${transfer._id}`, transfer)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  // Digital File List Service function
  public async getDigitalFileListsFromTransfer(transferId: any): Promise<any> {
    return await axios
      .get(`${API_URL}/transfers/${transferId}/digitalFileLists`)
      .then((response) => {
        console.log("in frontEnd");
        //const digitalFileLists: IDigitalFileList[] = response.data;
        return response.data;
      })
      .catch((error) => {
        console.error(error); 
        return error;
      });
  }

  public async updateDigitalFileList(
    transferId: string,
    digitalFileListId: string,
    updatedData: Partial<IDigitalFileListDTO>
  ): Promise<any> {
    try {
      const response = await axios.put(
        `${API_URL}/transfers/${transferId}/digitalFileLists/${digitalFileListId}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  public async createDigitalFileList(
    transferId: string,
    data: Partial<IDigitalFileListDTO>
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/transfers/${transferId}/digitalFileLists`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async deleteDigitalFileList(
    transferId: any,
    digitalFileListId: any
  ): Promise<any[]> {
    return await axios
      .delete(
        `${API_URL}/transfers/${transferId}/DigitalFileLists/${digitalFileListId}`
      )
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }
}
