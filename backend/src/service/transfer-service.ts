import mongoose, { FilterQuery } from "mongoose";
import TransferRepository from "../repository/transfer-repository";
import { ITransfer } from "../models/interfaces/ITransfer";
import { TransferStatus } from "../models/enums/TransferStatus";
import { Express } from 'express';
import fs from "fs";
import extractsFromAra66x from "../utils/extractsFromAra66x";
import extractsTransferInfo from "../utils/extractsTransferInfo";
import createFolder from "../utils/createFolder";
import extractsDigitalFileList from "../utils/extractsDigitalFileList";

export default class TransferService {
  private transferRepository: TransferRepository;

  constructor() {
    this.transferRepository = new TransferRepository();
  }

  async getTransfers(): Promise<ITransfer[] | null> {
    return await this.transferRepository.getTransfers();
  }
  async getTransferById(transferId: string): Promise<ITransfer | null> {
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

  async getSearchTransfers(
    transferFilters: FilterQuery<ITransfer>
  ): Promise<ITransfer[] | null> {
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

  async createFolder(
    filePath: string
  ) {
      const transferData = await extractsFromAra66x(filePath);

      const folderPath = process.env.TRANSFER_FOLDER ||"Transfer/";
      createFolder(folderPath);

      const accession_num=transferData?.accession;
      const application_num=transferData?.application;
      const subFolderPath = folderPath+accession_num+"-"+application_num+"/";
      createFolder(subFolderPath);

      return transferData;
  }

  async createTransferMetaData(
       filePath: string
  ) {
        console.log("---------------------Create Transfer--------------------------------");
        const transferData = await extractsFromAra66x(filePath);
        const accessionNumber = transferData?.accession || " ";
        const applicationNumber = transferData?.application || " ";
        const producerMinistry = transferData?.ministry || " ";
        const producerBranch = transferData?.branch || " ";

        const transferMetaData: ITransfer = {
          "accessionNumber": accessionNumber,
          "applicationNumber": applicationNumber,
          "producerMinistry": producerMinistry,
          "producerBranch": producerBranch
        }

        const newTransfer =await this.createTransfer(transferMetaData);
        return newTransfer;
  }

  async extractsTransferInfo(
    filePath: string
  ) {
      const transferData = await extractsTransferInfo(filePath);
      return transferData;
  }

  async upload(
    filePath: string
  ) {
      // Your upload service logic
      // const transferData = await extractsFromAra66x(filePath);

      // Need to check if the transfer is new

      // Respond with the extracted data
  }

  async createTransfer(transfer: ITransfer): Promise<ITransfer | null> {
    return await this.transferRepository.createTransfer(transfer);
  }

  async updateTransfer(
    transferId: string,
    updatedData: ITransfer
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

  async deleteTransfer(transferId: any) {
    return await this.transferRepository.deleteTransfer(transferId);
  }
}
