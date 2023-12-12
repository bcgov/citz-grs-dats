import { RequestHandler } from "express";
import TransferService from "../service/transfer-service";
import extractsFromAra66x from "./utils/extractsFromAra66x";
import fs from "fs";

export default class UploadController {
  // Constructor to initialize any properties or perform setup
  private transferService: TransferService;
  constructor() {
    // Initialize any properties or perform setup here if needed
    this.transferService = new TransferService();
  }
  handleARIS66xUpload: RequestHandler = async (req, res, next) => {
    try {
      // Handle the uploaded files here (e.g., save to the database)
      const uploadedFile = req.file;

      if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = uploadedFile.path;

      console.log(uploadedFile.fieldname);

      // Your upload service logic
      const transferData = await extractsFromAra66x(filePath);

      // Need to check if the transfer is new

      // Respond with the extracted data
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

  handleARIS617Upload: RequestHandler = async (req, res, next) => {
    try {
      // Handle the uploaded files here (e.g., save to the database)
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
}
