import TransferService from "../service/transfer-service";
import FileService from "../service/File-service";
import S3ClientService from "../service/s3Client-service";
import DigitalFileListService from "../service/digitalFileList-service";
import { RequestHandler } from "express";
import mongoose from "mongoose";



export default class UploadController {
  // Constructor to initialize any properties or perform setup
  private transferService: TransferService;
  private s3ClientService: S3ClientService;
  private fileService: FileService;
  private digitalFileListService: DigitalFileListService;
  private documentationPath: string;

  constructor() {
    // Initialize any properties or perform setup here if needed
    this.transferService = new TransferService();
    this.s3ClientService = new S3ClientService();
    this.fileService = new FileService();
    this.digitalFileListService = new DigitalFileListService();
    this.documentationPath = "";
  }

  handleARIS66xUpload: RequestHandler = async (req, res, next) => {
    try {

      const uploadedFile = req.file;

      if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const newTransfer = await this.transferService.createTransferMetaData(uploadedFile.path);
      const newTransferId = newTransfer?._id || new mongoose.mongo.ObjectId(0);
      const hashDigitalFileList = await this.digitalFileListService.createDigitalFileListMetaData(newTransferId.toString(), uploadedFile.path);
      // TODO Add the S3 PSP structure

      this.documentationPath = await this.s3ClientService.uploadAra66xFile(uploadedFile);

      const newDigitalFileList: any[] = [];
      hashDigitalFileList.forEach((value: any, key: string) => {
        newDigitalFileList.push(value);
      });

      res.status(201).json({
        "message": "Upload ARIS 66x successful",
        "transfer": {
          "accessionNumber": newTransfer?.accessionNumber,
          "applicationNumber": newTransfer?.applicationNumber,
          "transferStatus": newTransfer?.transferStatus,
          "digitalFileLists": newDigitalFileList,
          "producerMinistry": newTransfer?.producerMinistry,
          "producerBranch": newTransfer?.producerBranch,
          "_id": newTransfer?._id,
          "createDate": newTransfer?.createDate,
          "updatedDate": newTransfer?.updatedDate,
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }
  };

  get66xFileTransferInfos: RequestHandler = async (req, res, next) => {
    try {

      const aris66xFile = req.file;

      if (!aris66xFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const transferData = await this.transferService.extractsTransferInfo(aris66xFile.path);
      //console.log(transferData?.application + " " + transferData?.accession);

      res.status(201).json({
        accession: transferData?.accession,
        application: transferData?.application,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }

  }


  handleARIS617Upload: RequestHandler = async (req, res, next) => {
    try {

      const uploadedFile = req.file;

      //console.log("handleARIS617Upload, uploadedFile"+uploadedFile);

      if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const documentationPath = await this.s3ClientService.uploadARIS617File(uploadedFile, this.documentationPath);

      res.status(201).json({
        message: "Upload ARIS 617 successful",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }
  };
  saveSubmitAgreement: RequestHandler = async (req, res, next) => {
    try {
      const { agreementText, applicationNumber, accessionNumber, userDisplayName, formattedDate, status, decision } = req.body;
      const transferId = req.params.transferId;

      // Define the placeholders
      const placeholders = {
        ApplicationNumber: applicationNumber || '',
        AccessionNumber: accessionNumber || '',
        idir: userDisplayName || '',
        date: formattedDate || ''
      };

      const soumissionAgrement = await this.fileService.createAgreementPDF(
        agreementText,
        status,
        decision,
        placeholders
      );
      res.status(201).json({
        message: "Upload Soumission Agreement successful",
      });
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }


  saveFolderDetails: RequestHandler = async (req, res, next) => {
    try {
      const { file, body } = req;
      const { checksum: receivedChecksum, transferId, applicationNumber, accessNumber: accessionNumber, classification: primarySecondary, technicalV2: techMetadatav2 } = body;

      if (!file || !receivedChecksum || !applicationNumber || !accessionNumber || !primarySecondary) {
        return res.status(400).send('File, checksum, transferId, applicationNumber, accessionNumber or  classification missing');
      }

      await this.fileService.saveFolderDetails(file, receivedChecksum, transferId, applicationNumber, accessionNumber, primarySecondary, techMetadatav2);

      res.status(200).send('File uploaded and checksum verified');
    } catch (error) {
      res.status(500).json({ error: "An error occurred in the saveFolderDetails Function" });
    }
  }
}



