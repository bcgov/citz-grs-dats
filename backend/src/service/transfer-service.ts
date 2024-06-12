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

  /*async createFolder(
    uploadedFile: any,
    hashDigitalFileList: Map<string, any>*/
  async createFolder(
      uploadedFile: any  
  ) {
      const uploadedFilePath = uploadedFile.path;
      const startIndex=uploadedFilePath.indexOf("-");
      const originalFileName=uploadedFilePath.substring(startIndex+1);

      let transferData = await extractsFromAra66x(uploadedFile.path);

      const folderPath = process.env.TRANSFER_FOLDER ||"Transfer/";
      createFolder(folderPath);

      const accession_num=transferData?.accession;
      const application_num=transferData?.application;
      const subApplicationPath = folderPath+accession_num+"-"+application_num+"/";
      createFolder(subApplicationPath);
      const subDocPath = subApplicationPath+"Documentation/";
      createFolder(subDocPath);
      const targetFilePath=subDocPath+originalFileName;
      console.log("source: "+uploadedFilePath+";target: "+targetFilePath);
      fs.copyFile(uploadedFilePath, targetFilePath, (err) => {
        console.log(err);
      });

      /*
      hashDigitalFileList.forEach((value: any, key: string) => {
           const primarySecondary=value?.primarySecondary;
           if (primarySecondary) {
                const subPrimaryPath=subApplicationPath+primarySecondary+"/";
                var folder=value?.folder;
                if(folder) {
                        folder=folder.replace(":\\","-");
                        folder=folder.replace("\\","/");
                        const subPrimaryFolderPath=subPrimaryPath+folder+"/";
                        createFolder(subPrimaryPath);
                        createFolder(subPrimaryFolderPath);
                }
            }
      });*/

      return subDocPath;
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

  async uploadARIS617(
    filePath: string,
    documentationPath: string
  ) {
    //console.log("uploadARIS617.filePath="+filePath);
    const uploadedFilePath = filePath;
    const startIndex=uploadedFilePath.indexOf("-");
    const originalFileName=uploadedFilePath.substring(startIndex+1);

    const subDocPath = documentationPath;
    console.log("documentationPath: "+documentationPath);
    const targetFilePath=subDocPath+originalFileName;
    console.log("source: "+uploadedFilePath+";target: "+targetFilePath);
    fs.copyFile(uploadedFilePath, targetFilePath, (err) => {
      console.log(err);
    });

    return subDocPath;
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
