import TransferService from "../service/transfer-service";
import DigitalFileListService from "../service/digitalFileList-service";
import DigitalFileService from "../service/digitalFile-service";
import { RequestHandler } from "express";
import fs from "fs";
import mongoose from "mongoose";

export default class UploadController {
  // Constructor to initialize any properties or perform setup
  private transferService: TransferService;
  private digitalFileListService: DigitalFileListService;
  private digitalFileService: DigitalFileService;
  private documentationPath: string;

  constructor() {
    // Initialize any properties or perform setup here if needed
    this.transferService = new TransferService();
    this.digitalFileListService = new DigitalFileListService();
    this.digitalFileService = new DigitalFileService();
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
      //const newDigitalFiles=await this.digitalFileService.createDigitalFileMetaData(hashDigitalFileList, uploadedFile.path);

      //const transferData = await this.transferService.createFolder(uploadedFile,hashDigitalFileList);
      this.documentationPath = await this.transferService.createFolder(uploadedFile);
      //console.log("documentationPath="+this.documentationPath);

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

      const documentationPath = await this.transferService.uploadARIS617(uploadedFile.path, this.documentationPath);

      res.status(201).json({
        message: "Upload ARIS 617 successful",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }
  };

  checkAccessibility: RequestHandler = (req, res, next) => {
    const { folder } = req.query;

    if (typeof folder !== "string") {
      // Invalid or missing folder parameter
      return res.status(400).json({ error: "Invalid folder parameter" });
    }
    // Attempt to read the folder to check accessibility
    fs.readdir(folder, (error, files) => {
      if (error) {
        console.error("Error checking folder accessibility:", error);
        res.status(500).json({ accessible: false });
      } else {
        res.json({ accessible: true });
      }
    });
  };




};
