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
import S3ClientService from "./s3Client-service";

export default class TransferService {
  private transferRepository: TransferRepository;
  private s3ClientService: S3ClientService;

  constructor() {
    this.transferRepository = new TransferRepository();
    this.s3ClientService = new S3ClientService();
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
    if (transfer && transfer._id) {
      transfer.producerMinistry = producerMinistry;
      transfer.producerBranch = producerBranch;
      this.updateTransfer(transfer._id?.toString(), transfer);
    }
    const newTransfer = await this.createTransfer(transferMetaData);
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

  // async deleteTransfer(transferId: any) {
  //   return await this.transferRepository.deleteTransfer(transferId);
  // }

  async deleteTransfer(transferId: any) {
    // Find the transfer
    const transfer = await this.transferRepository.getTransfersById(transferId);
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    // Construct the folder path
    const folderPath = 'Transfers/' + transfer.accessionNumber + '-' + transfer.applicationNumber + '/';
    console.log("deleteTransfer:" + folderPath)
    // Delete the folder in S3
    await this.s3ClientService.deleteFolder(folderPath);

    // Delete the transfer
    return await this.transferRepository.deleteTransfer(transferId);
  }

  async createPSPs(transferId: any) {
    const transfer = await this.transferRepository.getTransfersById(transferId);
    if (!transfer) {
      throw new Error('Transfer not found');
    }

  }
}
