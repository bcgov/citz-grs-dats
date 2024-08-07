import mongoose, { FilterQuery } from "mongoose";
import TransferRepository from "../repository/transfer-repository";
import PspRepository from "../repository/psp-repository";
import { ITransfer } from "../models/interfaces/ITransfer";
import extractsFromAra66x from "../utils/extractsFromAra66x";
import extractsTransferInfo from "../utils/extractsTransferInfo";
import S3ClientService from "./s3Client-service";
import { IPsp } from "src/models/psp-model";
import { IDataExtractor } from "./data-extractor-service";
import DigitalFileListService from "./digitalFileList-service";
import { IDigitalFileList } from "../models/digitalFileList-model";
import logger from "../config/logs/winston-config";

export default class TransferService {
  private transferRepository: TransferRepository;
  private s3ClientService: S3ClientService;
  private pspRepository: PspRepository;
  private digitalFileService: DigitalFileListService;

  constructor() {
    this.transferRepository = new TransferRepository();
    this.s3ClientService = new S3ClientService();
    this.pspRepository = new PspRepository();
    this.digitalFileService = new DigitalFileListService();
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
async createTransferMetaDataV2(
  extractor: IDataExtractor,
  buffer: Buffer
) : Promise<{transfer: ITransfer | null,digitalFileList: IDigitalFileList[]} | null>
{
  logger.debug('parsing csv file');
  const extractedData = await extractor.extractDigitalFileAndTransferData(buffer);
  const accessionNumber = extractedData.transferData.accession;
  const applicationNumber = extractedData.transferData.application;
  const producerMinistry = extractedData.transferData.ministry;
  const producerBranch = extractedData.transferData.branch;
  logger.debug('parsing csv file - success');

  var transfer = await this.getTransferByKeysNumbers(accessionNumber, applicationNumber);
    if (transfer && transfer._id) {
      transfer.producerMinistry = producerMinistry;
      transfer.producerBranch = producerBranch;
  logger.debug('duplicate transfer - updating...');
      this.updateTransfer(transfer._id?.toString(), transfer);
    }
    else 
    {
      const transferMetaData: ITransfer = {
        "accessionNumber": accessionNumber,
        "applicationNumber": applicationNumber,
        "producerMinistry": producerMinistry,
        "producerBranch": producerBranch
      }
      transfer = await this.transferRepository.createTransfer(transferMetaData);
      logger.debug('new transfer created...');

    }
    const transferId = transfer?._id || new mongoose.mongo.ObjectId(0);

    const digitalFileListPromises = extractedData.digitalFileListData.map(dfl => this.digitalFileService.createDigitalFileListByTransferId(transferId.toString(), dfl));
    const digitalFileList = (await Promise.all(digitalFileListPromises)).filter((result): result is IDigitalFileList => result !== null);
    logger.debug('digitalFileService data inserted');

    return {transfer, digitalFileList};
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
      return await this.updateTransfer(transfer._id?.toString(), transfer);
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

  async addPspToTransfer(accessionNumber: string, applicationNumber: string, pspname: string, pspData: Partial<IPsp>): Promise<void> {
    // Find the transfer

    try {

      const transfer = await this.transferRepository.getTransferByKeysNumbers(accessionNumber, applicationNumber);
      console.log(' in the transfer' + transfer);
      if (!transfer) {
        throw new Error('Transfer not found');
      }
      let pspexist = await this.pspRepository.getPspByName(pspname);
      if (pspexist) {
        console.log('A PSP with the same name already exists in the transfer');
        // Create a new PSP or retrieve an existing one
      } else {


        let psp = await this.pspRepository.createPsp(pspData);

        // Add the PSP to the transfer
        transfer.psps?.push(psp._id);

        // Ensure transferId is a string
        if (!transfer._id) {
          throw new Error('Transfer ID is missing');
        }
        const transferIdString = transfer._id.toString();
        // Save the updated transfer
        await this.transferRepository.updateTransfer(transferIdString, transfer);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
