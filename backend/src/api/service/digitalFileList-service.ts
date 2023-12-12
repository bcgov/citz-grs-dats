import { IDigitalFileList } from "dats_shared/Types/interfaces/IDigitalFileList";
import DigitalFileListRepository from "../repository/digitalFileList-repository";

export default class DigitalFileListService {
  private digitalFileListRepository: DigitalFileListRepository;

  constructor() {
    this.digitalFileListRepository = new DigitalFileListRepository();
  }
  async getDigitalFileListsByTransferId(
    transferId
  ): Promise<IDigitalFileList[] | null> {
    return await this.digitalFileListRepository.getDigitalFileListsByTransferId(
      transferId
    );
  }

  async createDigitalFileListByTransferId(
    transferId,
    digitalFileList
  ): Promise<IDigitalFileList | null> {
    try {
      console.log("Transfer Id Service : " + transferId);
      return await this.digitalFileListRepository.createDigitalFileListByTransferId(
        transferId,
        digitalFileList
      );
    } catch (error) {
      console.error("Error: 2 ", error);
      throw error; // Re-throw the error or handle it as needed
    }
  }
  async deleteDigitalDatalistFromTransfer(transferId, digitalDatalistId) {
    console.log("digitalDatalistId Id Service : " + digitalDatalistId);

    return await this.digitalFileListRepository.deleteDigitalDatalistFromTransfer(
      transferId,
      digitalDatalistId
    );
  }
  async updateDigitalFileList(
    digitalDatalistId: string,
    updatedDigitalFileListData: any
  ): Promise<IDigitalFileList | null> {
    try {
      return await this.digitalFileListRepository.updateDigitalFileList(
        digitalDatalistId,
        updatedDigitalFileListData
      );
    } catch (error) {
      throw error;
    }
  }
}
