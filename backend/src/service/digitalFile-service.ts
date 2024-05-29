import DigitalFileRepository from "../repository/digitalList-repository";
import { IDigitalFile } from "../models/interfaces/IDigitalFile";
import extractsDigitalFile from "../utils/extractsDigitalFile";

export default class DigitalFileService {
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

  async createDigitalFileMetaData(
    hashDigtialFileList: Map<string, string>,
    filePath: string
  ) {
      const digitalFileListData = await extractsDigitalFile(filePath);
      
      let hash = new Map<string, string>();
      let folders = digitalFileListData?.folders || [];
      let paths = digitalFileListData?.objectPaths|| [];

      console.log("---------------------Create Mapping---------------------");
      console.log("folders.length="+folders.length);
      console.log("paths.length="+paths.length);
      for(let i=0; i<folders.length; i++) {
            let value: string = folders[i];
            for(let j=0; j<paths.length; j++) {
                let key: string = paths[j];
                if(key.includes(value)) {
                    hash.set(key, value);
                }
            }
      }

      //console.log("---------------------Print Mapping---------------------");
      //hash.forEach((value: string, key: string) => {
        //console.log(key, value);
      //});

      console.log("---------------------Create Digital File--------------------------------");
      let fileNames = digitalFileListData?.fileNames|| [];
      let sha256Checusums = digitalFileListData?.sha256Checusums|| [];
      let createdDates = digitalFileListData?.createdDates|| [];
      let lastModifiedDates = digitalFileListData?.lastModifiedDates|| [];
      let lastAccessedDates = digitalFileListData?.lastAccessedDates|| [];
      let authors = digitalFileListData?.authors|| [];
      let owners = digitalFileListData?.owners|| [];
      let companies = digitalFileListData?.companies|| [];
      let computers = digitalFileListData?.computers|| [];
      let contentTypes = digitalFileListData?.contentTypes|| [];
      let programNames = digitalFileListData?.programNames|| [];
      let sizes = digitalFileListData?.sizes|| [];
      let revisionNumbers = digitalFileListData?.revisionNumbers|| [];

      let newDigitalFile;
      for(let i=0; i<paths.length; i++) {
          
          let path = paths[i];
          let folder = hash.get(path) || "0";
          let digitalFileListId = hashDigtialFileList.get(folder) || "0";
          console.log("path="+path+", folder="+folder+", digitalFileListId="+digitalFileListId);
          
          const digitalFileMetaData = {
            checksum_SHA_256: sha256Checusums[i],
            filePath: path,
            fileName: fileNames[i],
            objectCreateDate: createdDates[i],
            lastModifiedDate: lastModifiedDates[i],
            lastAccessDate: lastAccessedDates[i],
            authors: authors[i],
            owners: owners[i],
            company: companies[i],
            computer: computers[i],
            contenType: contentTypes[i],
            programType: programNames[i],
            size: sizes[i],
            version: revisionNumbers[i]
          };

          newDigitalFile =await this.createDigitalFileByDigitalFileListId(digitalFileListId,digitalFileMetaData);
          console.log("newDigitalFile.id"+newDigitalFile?._id);
      }
      
      return newDigitalFile;
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
