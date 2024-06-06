import { IDigitalFileList } from "../models/interfaces/IDigitalFileList";
import DigitalFileListRepository from "../repository/digitalFileList-repository";
import extractsDigitalFileList from "../utils/extractsDigitalFileList";

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

  async createDigitalFileListMetaData(
    transferId: string,
    filePath: string
  ) {
      const digitalFileListData = await extractsDigitalFileList(filePath);
      const folders = digitalFileListData?.folders || [];
      const schedules = digitalFileListData?.schedules || [];
      const primaries = digitalFileListData?.primaries|| [];
      const fileIds = digitalFileListData?.fileIds|| [];
      const fileTitles = digitalFileListData?.fileTitles|| [];
      const oprflags = digitalFileListData?.oprflags|| [];
      const startDates = digitalFileListData?.startDates|| [];
      const endDates = digitalFileListData?.endDates|| [];
      const soDates = digitalFileListData?.soDates|| [];
      const finalDispositionDates = digitalFileListData?.finalDispositionDates|| [];

      let hashDigitalFileList = new Map<string, any>();
      for(let i=0; i<folders.length; i++) {
            var digitalFileListMetaData = {
              "primarySecondary": primaries[i],
              "schedule": schedules[i],
              "description": fileTitles[i],
              "fileId": fileIds[i],
              "folder": folders[i],
              "transfer":transferId,
              "isOPR": oprflags[i] == 'Y'?true: false,
              "startDate": startDates[i],
              "endtDate": endDates[i],
              "finalDispositionDate": finalDispositionDates[i]
            } ;

            const newDigitalFileList =await this.createDigitalFileListByTransferId(transferId,digitalFileListMetaData);
            let key: string = newDigitalFileList?.folder || " ";
            let content = newDigitalFileList;
            //let content: string = newDigitalFileList?._id.toString() || " ";
            hashDigitalFileList.set(key,content)
      }
      
      return hashDigitalFileList;
  }
  

  async createDigitalFileListByTransferId(
    transferId: string,
    digitalFileList: any
  ): Promise<IDigitalFileList | null> {
    try {
      //console.log("Transfer Id Service : " + transferId);
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
