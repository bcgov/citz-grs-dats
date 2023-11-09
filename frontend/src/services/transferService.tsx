import axios from "axios";
// import ITransfer from "../Types/ITransfer"; // Adjust the path to the ITransfer interface
import { ITransfer } from "dats_shared/Types/interfaces/ITransfer";
const API_URL = "http://localhost:5000/api/"; // Replace with your API endpoint URL

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
      .get<ITransfer>(`${API_URL}transfers/${transferId}`)
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
      .post(`${API_URL}transfers`, data)
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

  public async deleteTransfer(transferID: any): Promise<ITransfer[]> {
    return await axios
      .delete<ITransfer[]>(`${API_URL}transfers/${transferID}`)
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
      .put<ITransfer[]>(`${API_URL}transfers/${transfer._id}`, transfer)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }
}
