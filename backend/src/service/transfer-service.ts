import { FilterQuery } from "mongoose";
import TransferRepository from "../repository/transfer-repository";
import { ITransfer } from "../models/interfaces/ITransfer";
import { Express } from 'express';
import fs from "fs";
import extractsFromAra66x from "../utils/extractsFromAra66x";
import extractsTransferInfo from "../utils/extractsTransferInfo";
import createFolder from "../utils/createFolder";

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
        var folderPath = process.env.TRANSFER_FOLDER ||"Transfer/";
        createFolder(folderPath);

        var accession_num=transferData?.accession;
        var application_num=transferData?.application;
        var subFolderPath = folderPath+accession_num+"-"+application_num+"/";
        createFolder(subFolderPath);
        
        return transferData;
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
