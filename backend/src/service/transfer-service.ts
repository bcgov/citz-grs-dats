import { FilterQuery } from "mongoose";
import TransferRepository from "../repository/transfer-repository";
import PspRepository from "../repository/psp-repository";
import { ITransfer } from "../models/interfaces/ITransfer";
import extractsFromAra66x from "../utils/extractsFromAra66x";
import extractsTransferInfo from "../utils/extractsTransferInfo";
import S3ClientService from "./s3Client-service";
import { IPsp } from "src/models/psp-model";

export default class TransferService {
  private transferRepository: TransferRepository;
  private s3ClientService: S3ClientService;
  private pspRepository: PspRepository;

  constructor() {
    this.transferRepository = new TransferRepository();
    this.s3ClientService = new S3ClientService();
    this.pspRepository = new PspRepository();
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

  async addPspToTransfer(accessionNumber: string, applicationNumber: string, pspData: Partial<IPsp>): Promise<any> {
    // Find the transfer

    try {

      const transfer = await this.transferRepository.getTransferByKeysNumbers(accessionNumber, applicationNumber);
      console.log(' in the transfer' + transfer);
      if (!transfer) {
        throw new Error('Transfer not found');
      }
      // Check if a PSP with the same name already exists in the transfer
      if (transfer.psps) {
        for (let i = 0; i < transfer.psps.length; i++) {
          let pspIdString = transfer.psps[i].toString();
          let psp = await this.pspRepository.getPspById(pspIdString);
          if (psp && psp.name === pspData.name) {
            console.log('A PSP with the same name already exists in the transfer');
            return transfer; // Return the existing transfer without creating a new PSP
          }
        }
      }


      // Create a new PSP or retrieve an existing one
      let psp = await this.pspRepository.createPsp(pspData);

      // Add the PSP to the transfer
      transfer.psps?.push(psp._id);

      // Ensure transferId is a string
      if (!transfer._id) {
        throw new Error('Transfer ID is missing');
      }
      const transferIdString = transfer._id.toString();
      // Save the updated transfer
      const updatedTransfer = await this.transferRepository.updateTransfer(transferIdString, transfer);
      return updatedTransfer;
    } catch (error) {
      console.log(error);
    }
  }
}
