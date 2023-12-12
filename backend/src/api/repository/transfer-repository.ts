import { FilterQuery } from "mongoose";
import { TransferModel } from "../model/transfer-model";
// import { TransferModel } from "@model/transfer-model";
import { ITransfer } from "dats_shared/Types/interfaces/ITransfer";

export default class TransferRepository {
  constructor() {}

  async getTransfers(): Promise<ITransfer[] | null> {
    const transfers = await TransferModel.find({});
    console.log("transfers:::", transfers);
    return transfers;
  }
  async getTransfersById(transferId): Promise<ITransfer | null> {
    const transfer = await TransferModel.findById(transferId);
    console.log("transfer:::", transfer);
    return transfer;
  }
  async getTransfer(
    accessionnumber: string,
    applicationnumber: string
  ): Promise<ITransfer | null> {
    const transfer = await TransferModel.findOne({
      accessionnumber,
      applicationnumber,
    });
    console.log("transfer:::", transfer);
    return transfer;
  }

  async getSearchTransfers(
    transferFilters: FilterQuery<ITransfer>
  ): Promise<ITransfer[] | null> {
    const transfers = await TransferModel.find(transferFilters);
    console.log("transfer:::", transfers);
    return transfers;
  }

  async getTransferByKeysNumbers(
    accessionNumber: string,
    applicationNumber: string
  ): Promise<ITransfer | null> {
    try {
      return await TransferModel.findOne({
        accessionNumber,
        applicationNumber,
      });
    } catch (error) {
      throw error;
    }
  }
  async createTransfer(transferInput: ITransfer): Promise<ITransfer | null> {
    try {
      const newTransfer = await TransferModel.create(transferInput);
      return newTransfer;
    } catch (error) {
      console.error("Error:", error);
      throw error; // Re-throw the error or handle it as needed
    }
  }

  async updateTransfer(
    transferId: string,
    updatedData: ITransfer
  ): Promise<ITransfer | null> {
    try {
      const updatedTransfer = await TransferModel.findByIdAndUpdate(
        transferId,
        updatedData,
        { new: true } // This option returns the updated document after the update
      );

      if (!updatedTransfer) {
        throw new Error("Transfer not found");
      }

      return updatedTransfer;
    } catch (error) {
      throw error;
    }
  }

  async deleteTransfer(transferId: string) {
    let data: any = {};
    try {
      data = await TransferModel.deleteOne({ _id: transferId });
    } catch (err) {
      console.log("Error::" + err);
    }
    return { status: `${data.deletedCount > 0 ? true : false}` };
  }
}
