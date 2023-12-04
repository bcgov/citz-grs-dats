import { DigitalFileRepository } from "../repository/digitalList-repository";
import { IDigitalFile } from "dats_shared/Types/interfaces/IDigitalFile";

export class DigitalFileService {
  private digitalFileRepository: DigitalFileRepository;

  constructor() {
    this.digitalFileRepository = new DigitalFileRepository();
  }
  async getDigitalFilesByDigitalFileListId(
    digitalFileListId
  ): Promise<IDigitalFile[] | null> {
    return await this.digitalFileRepository.getDigitalFilesByDigitalFileListId(
      digitalFileListId
    );
  }
  async createDigitalFileByDigitalFileListId(
    digitalFileListId: string,
    digitalFile: any
  ): Promise<IDigitalFile | null> {
    try {
      console.log("DigitalFileLis Id Service : " + digitalFileListId);
      return await this.digitalFileRepository.createDigitalFileByDigitalFileListId(
        digitalFileListId,
        digitalFile
      );
    } catch (error) {
      console.error("Error: 2 ", error);
      throw error; // Re-throw the error or handle it as needed
    }
  }
}
