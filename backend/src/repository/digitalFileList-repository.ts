import { TransferModel } from "../models/transfer-model";
import {
  DigitalFileListModel,
  IDigitalFileList,
} from "../models/digitalFileList-model";

export default class DigitalFileListRepository {
  constructor() { }

  async getDigitalFileListsByTransferId(
    transferId: any
  ): Promise<IDigitalFileList[] | null> {
    try {
      const transfer = await TransferModel.findById(transferId).populate(
        "digitalFileLists"
      ); // Use Mongoose populate to retrieve referenced documents
      if (!transfer) {
        throw new Error("Transfer not found");
      }
      // Ensure that transfer.digitalFileLists is an array of ObjectId references
      const digitalFileListIds = transfer.digitalFileLists;

      // Use the $in operator to retrieve the associated digitalFileList documents
      const digitalFileLists = await DigitalFileListModel.find({
        _id: { $in: digitalFileListIds },
      });

      return digitalFileLists;
    } catch (error) {
      console.error("Error:", error);
      throw error; // Re-throw the error or handle it as needed
    }
  }

  async createDigitalFileListByTransferId(
    transferId: string,
    digitalFileListInput: any
  ): Promise<IDigitalFileList | null> {
    try {
      //console.log(digitalFileListInput);
      const newdigitalFileList = new DigitalFileListModel({
        primarySecondary: digitalFileListInput.primarySecondary,
        schedule: digitalFileListInput.schedule,
        description: digitalFileListInput.description,
        fileId: digitalFileListInput.fileId,
        folder: digitalFileListInput.folder,
        folderSend: digitalFileListInput.folder,
        fileTitle: digitalFileListInput.fileTitle,
        transfer: transferId,
        isOPR: digitalFileListInput.isOPR,
        startDate: digitalFileListInput.startDate,
        endtDate: digitalFileListInput.endtDate,
        finalDispositionDate: digitalFileListInput.finalDispositionDate,
      });
      //console.log(newdigitalFileList);
      const digitalFileList = await DigitalFileListModel.create(
        newdigitalFileList
      );

      const transfer = await TransferModel.findById({
        _id: digitalFileList.transfer,
      });
      if (transfer) {
        transfer.digitalFileLists?.push(digitalFileList.id);
        await transfer.save();
      }
      return digitalFileList;
    } catch (error) {
      console.error("Error:", error);
      throw error; // Re-throw the error or handle it as needed
    }
  }

  async deleteDigitalDatalistFromTransfer(
    transferId: string,
    digitalDatalistId: string
  ) {
    let data: any = {};
    try {
      // Find the Transfer document
      const transfer = await TransferModel.findById(transferId);

      if (!transfer) {
        throw new Error("Transfer not found");
      }

      const digitalFileList = await DigitalFileListModel.findById(
        digitalDatalistId
      );

      // Remove the reference to the DigitalFileList from the Transfer's digitalFileLists array
      const index = transfer.digitalFileLists?.indexOf(digitalFileList?._id);

      if (index !== -1) {
        transfer.digitalFileLists?.splice(index as number, 1);
      }

      await transfer.save();

      const deletedInstance = await DigitalFileListModel.findOneAndDelete({
        _id: digitalDatalistId,
      });
      data.deletedCount = deletedInstance;

      console.log("after deleteOne ");
    } catch (err) {
      console.error("Error:", err);
      return { status: false, error: "err.message" }; // Return an error status and message
    }

    return { status: true, message: "DigitalDatalist deleted successfully" };
  }

  // Define an asynchronous function to handle the update
  async updateDigitalFileList(
    digitalFileListId: string,
    updateData: any
  ): Promise<IDigitalFileList | null> {
    try {
      // Find the DigitalFileList document by ID and update its fields
      console.log("In updateDigitalFileList repo:", digitalFileListId);
      console.log("In updateDigitalFileList repo:", updateData);

      const updateDigitalFileList =
        await DigitalFileListModel.findByIdAndUpdate(
          digitalFileListId,
          updateData,
          { new: true } // Return the updated document
        );

      if (!updateDigitalFileList) {
        throw new Error("Digital File List not found");
      }
      console.log("updateDigitalFileList  = " + updateDigitalFileList)
      // Respond with the updated DigitalFileList document
      return updateDigitalFileList;
    } catch (error) {
      throw new Error("error in update Digital File List " + error);

    }
  }
}
