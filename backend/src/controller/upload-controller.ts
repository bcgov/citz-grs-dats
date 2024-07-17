import TransferService from "../service/transfer-service";
import FileService from "../service/File-service";
import createAgreementPDF from "../service/File-service";
import S3ClientService from "../service/s3Client-service";
import DigitalFileListService from "../service/digitalFileList-service";
import { RequestHandler } from "express";
import crypto from 'crypto';
import mongoose from "mongoose";
import { IPsp } from "src/models/psp-model";


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
      res.status(200).json(soumissionAgrement);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }


  saveFolderDetails: RequestHandler = async (req, res, next) => {
    try {

      const file = req.file;
      const receivedChecksum = req.body.checksum;
      const transferId = req.body.transferId;
      const applicationNumber = req.body.applicationNumber;
      const accessionNumber = req.body.accessNumber;
      const primarySecondary = req.body.classification;
      const techMetadatav2 = req.body.technicalV2;
      //folderPath  validation
      if (!file || !receivedChecksum || !applicationNumber || !accessionNumber || !primarySecondary) {
        return res.status(400).send('File, checksum, transferId, applicationNumber, accessionNumber or  classification missing');
      }
      // Calculate the SHA-1 checksum of the uploaded file
      const hash = crypto.createHash('sha1');
      hash.update(file.buffer);
      const calculatedChecksum = hash.digest('hex');
      // Compare checksums
      if (calculatedChecksum === receivedChecksum) {
        var obj = `{
      "code" : "shah1",
      "checksume" : receivedChecksum,
     }`;

        //convert object to json string
        var checksumString = JSON.stringify(obj);

        const s3ClientService = new S3ClientService();
        var transferFolderPath = process.env.TRANSFER_FOLDER_NAME || 'Transfers';

        // Create the PSP structure per classification     ex. PSP-94-1434-749399-11000-20

        const pspname = 'PSP-' + accessionNumber + "-" + applicationNumber + "-" + primarySecondary + "-01"
        const psppath = transferFolderPath + "/" + accessionNumber + "-" + applicationNumber + "/" + pspname + "/";
        s3ClientService.createFolder(psppath);

        // Create the PSP entities in Transfer
        //transferFolderPath = transferFolderPath + "/" + accessionNumber + "-" + applicationNumber + "/Contents/" + primarySecondary;

        // Create the Folder




        // store the zip and checksum
        const zipFilePath = s3ClientService.uploadZipFile(file, applicationNumber, accessionNumber, primarySecondary, checksumString, psppath);



        const techMetadatav2test = [
          {
            "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\1-MB-DOC.doc",
            "FileName": "1-MB-DOC.doc",
            "Checksum": "88dc8b79636f7d5131d2446c6855ca956a176932",
            "DateCreated": "2024-06-27T16:32:40.7403152-04:00",
            "DateModified": "2024-06-27T16:32:43.6795841-04:00",
            "DateAccessed": "2024-07-15T19:09:13.1135847-04:00",
            "DateLastSaved": "2024-06-27T16:32:43.6795841-04:00",
            "AssociatedProgramName": "Pick an application",
            "Owner": "IDIR\\NSYED",
            "Computer": "VIRTUAL-MIND",
            "ContentType": "application/octet-stream",
            "SizeInBytes": 1048576
          },
          {
            "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\138-KB-XML-File.xml",
            "FileName": "138-KB-XML-File.xml",
            "Checksum": "abd4a088b49d9f9863be4f7fda45a0528f6a4af8",
            "DateCreated": "2024-06-27T16:39:14.7746566-04:00",
            "DateModified": "2024-06-27T16:39:19.0695192-04:00",
            "DateAccessed": "2024-07-15T19:09:13.1193231-04:00",
            "DateLastSaved": "2024-06-27T16:39:19.0695192-04:00",
            "AssociatedProgramName": "Microsoft Edge",
            "Owner": "IDIR\\NSYED",
            "Computer": "VIRTUAL-MIND",
            "ContentType": "application/octet-stream",
            "SizeInBytes": 141317
          }
        ]


        // Upload the technical metadata v2
        const jsonFileResponsedata = await s3ClientService.uploadTechnicalV2File(techMetadatav2test, psppath);


        const pspData: Partial<IPsp> = {
          name: pspname,
          pathToS3: psppath,
          pathToLan: " ",
          pspStatus: "To be Create"
        };
        // add the psp to the transfer

        this.transferService.addPspToTransfer(transferId, pspData)
          .then(updatedTransfer => {
            console.log("Updated Transfer:", updatedTransfer);
          })
          .catch(error => {
            console.error("Error adding PSP to Transfer:", error);
          });

        console.log('all good');
        res.status(200).send('File uploaded and checksum verified');

      } else {
        // Handle checksum mismatch
        console.log('checksum mismatch');
        // const transferService = new TransferService();
        // transferService.deleteTransfer(transferId)
        res.status(400).send('Checksum mismatch');
      }

    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }

}



