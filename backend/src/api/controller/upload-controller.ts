import { RequestHandler } from "express";
import TransferService from "../service/transfer-service";
import FileService from "../service/File-service";
import extractsFromAra66x from "./utils/extractsFromAra66x";
import extractsTransferInfo from "./utils/extractsTransferInfo";
import fs from "fs";

export default class UploadController {
  // Constructor to initialize any properties or perform setup
  private transferService: TransferService;
  private fileService: FileService;

  constructor() {
    // Initialize any properties or perform setup here if needed
    this.transferService = new TransferService();
    this.fileService = new FileService();
    this.getMetadatas = this.getMetadatas.bind(this);
    this.getFilesinFolder = this.getFilesinFolder.bind(this);
  }
  handleARIS66xUpload: RequestHandler = async (req, res, next) => {
    try {

      const uploadedFile = req.file;

      if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = uploadedFile.path;

      console.log(uploadedFile.fieldname);


      const transferData = await extractsFromAra66x(filePath);

      console.log(transferData?.folders);


      res.status(201).json({
        message: "Upload ARIS 66x successful",
        accession: transferData?.accession,
        application: transferData?.application,
        ministry: transferData?.ministry,
        branch: transferData?.branch,
        folders: transferData?.folders,
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

      const filePath = aris66xFile.path;

      console.log(aris66xFile.fieldname);


      const transferData = await extractsTransferInfo(filePath);

      console.log(transferData?.application + " " + transferData?.accession);


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

      if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = uploadedFile.path;

      console.log(uploadedFile.fieldname);

      // Your upload service logic
      // const transferData = await extractsFromAra66x(filePath);

      // Need to check if the transfer is new

      // Respond with the extracted data
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

  getMetadatas: RequestHandler = async (req, res, next) => {
    // Get the file path from the query parameter
    try {
      // Get the file path from the query parameter
      const filePath = req.query.path;
      const response = await FileService.getMetadatas(filePath);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }

  getFilesinFolder: RequestHandler = async (req, res, next) => {
    // Get the file path from the query parameter
    try {
      // Get the file path from the query parameter
      const filePath = req.query.path;
      const response = await FileService.getMetadatas(filePath);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }

};
