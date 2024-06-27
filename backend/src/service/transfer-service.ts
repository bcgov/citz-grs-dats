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
import multer from "multer";

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

  async createTransferMetaData(
       filePath: string
  ) {
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
        //check if the transfer exists before creating one
        var transfer = await this.getTransferByKeysNumbers(accessionNumber, applicationNumber);
        if(transfer && transfer._id)
          {
            transfer.producerMinistry = producerMinistry;
            transfer.producerBranch = producerBranch;
            this.updateTransfer(transfer._id?.toString() , transfer);
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
