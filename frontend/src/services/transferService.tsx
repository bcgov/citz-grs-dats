import axios from "axios";
import ITransferDTO from "../types/DTO/Interfaces/ITransferDTO";
import { IDigitalFileListDTO } from "../types/DTO/Interfaces/IDigitalFileListDTO";

const API_URL = `/api`; // Replace with your API endpoint URL

export class TransferService {

  public async getTransferByApplicationAccessionNumber(
    accessionNumber: string,
    applicationNumber: string,
    onResponse: (data: ITransferDTO) => void,
    onError: (error: any) => void,
    onFinally?: () => void
  ): Promise<void> {
    var response = await axios
      .get<ITransferDTO>(`${API_URL}/api/transfer/${accessionNumber}/${applicationNumber}`)
      .then((response) => {
        onResponse(response.data);
      })
      .catch((error) => {
        onError(error);
      })
      .finally(() => {
        if (onFinally) {
          onFinally();
        }
      })
  }

  public async getTransfers(): Promise<ITransferDTO[]> {
    return await axios
      .get<ITransferDTO[]>(`${API_URL}/api/transfers`)
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
      .get<ITransferDTO>(`${API_URL}/api/transfers/${transferId}`)
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
      .delete<ITransferDTO[]>(`${API_URL}/api/transfers/${transferID}`)
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
      .put<ITransferDTO[]>(`${API_URL}/api/transfers/${transfer._id}`, transfer)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  

  public async createPSPs(
    transferId: any,
  ): Promise<any[]> {
    return await axios
      .post(
        `${API_URL}/api/transfers/${transferId}/createPSPs`
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
