import { TransferRepository } from "../repository/transfer-repository";
// import { TransferRepository } from "@repository/transfer-repository";
import { ITransfer } from "dats_shared/Types/interfaces/ITransfer";

export class TransferService {
  private transferRepository: TransferRepository;

  constructor() {
    this.transferRepository = new TransferRepository();
  }

  async getTransfers(): Promise<ITransfer[] | null> {
    return await this.transferRepository.getTransfers();
  }
  async getTransferById(transferId): Promise<ITransfer | null> {
    return await this.transferRepository.getTransfersById(transferId);
  }
  async getTransfer(
    accessionnumber: any,
    applicationnumber: any
  ): Promise<ITransfer | null> {
    return await this.transferRepository.getTransfer(
      accessionnumber,
      applicationnumber
    );
  }

  async getSearchTransfers(transferFilters): Promise<ITransfer[] | null> {
    return await this.transferRepository.getSearchTransfers(transferFilters);
  }
  async getTransferByKeysNumbers(
    accessionNumber: string,
    applicationNumber: string
  ): Promise<ITransfer | null> {
    return await this.transferRepository.getTransferByKeysNumbers(
      accessionNumber,
      applicationNumber
    );
  }

  async createTransfer(transfer): Promise<ITransfer | null> {
    return await this.transferRepository.createTransfer(transfer);
  }

  async updateTransfer(
    transferId: string,
    updatedData: any
  ): Promise<ITransfer | null> {
    try {
      return await this.transferRepository.updateTransfer(
        transferId,
        updatedData
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteTransfer(transferId) {
    return await this.transferRepository.deleteTransfer(transferId);
  }
}
