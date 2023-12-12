import { DigitalFileListModel } from "../model/digitalFileList-model";
import { IDigitalFile } from "dats_shared/Types/interfaces/IDigitalFile";
import { DigitalFileModel } from "../model/digitalFile-model";

export default class DigitalFileRepository {
  constructor() {}

  async getDigitalFilesByDigitalFileListId(
    digitalFileListId: any
  ): Promise<IDigitalFile[] | null> {
    try {
      // Find the DigitalFileList by its ID and populate the DigitalFile field
      const digitalFileList = await DigitalFileListModel.findById(
        digitalFileListId
      )
        .populate("digitalFiles")
        .exec();
      // if (!digitalFileList) {
      //   throw new Error("DigitalFileList not found");
      // }
      // Ensure that transfer.digitalFileLists is an array of ObjectId references
      const digitalFileListIds = digitalFileList?.digitalFiles;
      // if (!digitalFileListIds) {
      //   throw new Error("DigitalFileList Ids not found");
      // }

      // Use the $in operator to retrieve the associated digitalFileList documents
      const digitalFiles = await DigitalFileModel.find({
        _id: { $in: digitalFileList?.digitalFiles },
      });

      return digitalFiles; // Return the DigitalFile
    } catch (error) {
      throw error;
    }
  }
  async createDigitalFileByDigitalFileListId(
    digitalFileLisId: string,
    digitalFileInput: any
  ): Promise<IDigitalFile | null> {
    try {
      console.log(digitalFileLisId);
      const newdigitalfile = new DigitalFileModel({
        checksum_MD5: digitalFileInput.checksum_MD5,
        checksum_SHA_1: digitalFileInput.checksum_SHA_1,
        checksum_SHA_256: digitalFileInput.checksum_SHA_256,
        checksum_SHA_512: digitalFileInput.checksum_SHA_512,
        fileName: digitalFileInput.fileName,
        objectCreateDate: digitalFileInput.objectCreateDate,
        lastModifiedDate: digitalFileInput.lastModifiedDate,
        lastAccessDate: digitalFileInput.lastAccessDate,
        lastSaveDate: digitalFileInput.lastSaveDate,
        lastSaveBy: digitalFileInput.lastSaveBy,
        authors: digitalFileInput.authors,
        owners: digitalFileInput.owners,
        compagny: digitalFileInput.compagny,
        computer: digitalFileInput.computer,
        contenType: digitalFileInput.contenType,
        programType: digitalFileInput.programType,
        size: digitalFileInput.size,
        version: digitalFileInput.version,
        description: digitalFileInput.description,
        fileId: digitalFileInput.fileId,
        digitalObject: "",
        startDate: digitalFileInput.startDate,
        endtDate: digitalFileInput.endtDate,
        finalDispositionDate: digitalFileInput.finalDispositionDate,
        digitalFileList: digitalFileLisId,
      });
      console.log(newdigitalfile);
      const digitalFile = await DigitalFileModel.create(newdigitalfile);

      const digitalFileList = await DigitalFileListModel.findById({
        _id: digitalFileLisId,
      });
      if (digitalFileList) {
        digitalFileList.digitalFiles.push(digitalFile.id);
        await digitalFileList.save();
      }
      return digitalFile;
    } catch (error) {
      console.error("Error:", error);
      throw error; // Re-throw the error or handle it as needed
    }
  }
}
