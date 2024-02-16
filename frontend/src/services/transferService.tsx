import axios from "axios";
// import ITransfer from "../Types/ITransfer"; // Adjust the path to the ITransfer interface
import { ITransfer } from "dats_shared/Types/interfaces/ITransfer";
import { IDigitalFileList } from "dats_shared/Types/interfaces/IDigitalFileList";

const API_URL = "http://localhost:5000/api"; // Replace with your API endpoint URL

export class TransferService {
  public async getTransfers(): Promise<ITransfer[]> {
    return await axios
      .get<ITransfer[]>(`${API_URL}/transfers`)
      .then((response) => {
        const transfers: ITransfer[] = response.data;
        return transfers;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async getTransfer(transferId: string): Promise<ITransfer> {
    return await axios
      .get<ITransfer>(`${API_URL}/transfers/${transferId}`)
      .then((response) => {
        const transfer: ITransfer = response.data;
        return transfer;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  //   public async getTransfer(transferId: number): Promise<any> {
  //     const response = await fetch(`/transfers/${transferId}`);
  //     return await response.json();
  //   }

  public async createTransfer(data: any): Promise<ITransfer> {
    return await axios
      .post(`${API_URL}/transfers`, data)
      .then((response) => {
        const transfer: ITransfer = response.data;
        return transfer;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  //   public async deleteTransfer(transferId: number): Promise<any> {
  //     const response = await fetch(`/transfers/${transferId}`, {
  //       method: "DELETE",
  //     });
  //     return await response.json();
  //   }

  public async deleteTransfer(transferID: any): Promise<any> {
    return await axios
      .delete<ITransfer[]>(`${API_URL}/transfers/${transferID}`)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async updateTransfer(transfer: any): Promise<ITransfer[]> {
    return await axios
      .put<ITransfer[]>(`${API_URL}/transfers/${transfer._id}`, transfer)
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
    updatedData: Partial<IDigitalFileList>
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
    data: Partial<IDigitalFileList>
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
