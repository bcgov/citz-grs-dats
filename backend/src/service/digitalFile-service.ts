import DigitalFileRepository from "../repository/digitalList-repository";
import { IDigitalFile } from "../models/interfaces/IDigitalFile";
import extractsDigitalFileList from "../utils/extractsDigitalFileList";

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
      const digitalFileListData = await extractsDigitalFileList(filePath);
      
      let hash = new Map<string, string[]>();
      let folders =digitalFileListData?.folders || [];
      let paths =digitalFileListData?.objectPaths || [];

      for(let i=0; i<folders.length; i++) {
            let key: string = folders[i];
            //console.log("folders "+i+" key="+key);
            for(let j=0; j<paths.length; j++) {
                let content: string = paths[j];

                //console.log("key: "+key+", "+j+", content: "+content)
                if(content.includes(key)) {
                    //console.log("Find Key");
                    let values:string[] = hash.get(key) || [];
                    values.push(content);
                    hash.set(key, values);
                }else {
                  //console.log("Not Key");
                }
            }
      }

      //console.log("---------------------Print Mapping---------------------");
      //hash.forEach((value: string[], key: string) => {
        //console.log(key, value);
      //});
      
      const digitalFileListId = "6656393725d0e86de728840a";
      const digitalFileMetaData = {
        checksum_MD5: "daaa977d61b90800853314c625e54ca8a6a6ec2fb6b4208ff88e724042e87e21",
        checksum_SHA_1: "daaa977d61b90800853314c625e54ca8a6a6ec2fb6b4208ff88e724042e87e21",
        checksum_SHA_256: "daaa977d61b90800853314c625e54ca8a6a6ec2fb6b4208ff88e724042e87e21",
        checksum_SHA_512: "daaa977d61b90800853314c625e54ca8a6a6ec2fb6b4208ff88e724042e87e21",
        filePath:"C:\\doc\\test.doc",
        fileName: "cloud_security_schedule.pdf",
        objectCreateDate: "10/17/2023",
        lastModifiedDate: "10/17/2023",
        lastAccessDate: "10/17/2023",
        lastSaveDate: "10/17/2023",
        lastSaveBy: "Jacques Levesque",
        authors: "Jacques Levesque",
        owners: "Jacques Levesque",
        compagny: "BC gov",
        computer: "CA-L19NW8G3 (this PC)",
        contenType: "Adobe Acrobat Document",
        programType: "",
        size: "1.40 MB",
        version: "",
        description: "",
        fileId: "",
        digitalObject: "",
        startDate: "10/17/2023",
        endtDate: "10/17/2023",
        finalDispositionDate: "10/17/2023"
      };

      const newDigitalFile =await this.createDigitalFileByDigitalFileListId(digitalFileListId,digitalFileMetaData);
      
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
