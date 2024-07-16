import TransferService from "../service/transfer-service";
import FileService from "../service/File-service";
import createAgreementPDF from "../service/File-service";
import S3ClientService from "../service/s3Client-service";
import DigitalFileListService from "../service/digitalFileList-service";
import DigitalFileService from "../service/digitalFile-service";
import { RequestHandler } from "express";
import crypto from 'crypto';
import mongoose from "mongoose";


export default class UploadController {
  // Constructor to initialize any properties or perform setup
  private transferService: TransferService;
  private s3ClientService: S3ClientService;
  private fileService: FileService;
  private digitalFileListService: DigitalFileListService;
  private digitalFileService: DigitalFileService;
  private documentationPath: string;

  constructor() {
    // Initialize any properties or perform setup here if needed
    this.transferService = new TransferService();
    this.s3ClientService = new S3ClientService();
    this.fileService = new FileService();
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



      const techMetadatav2json = [
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
        },
        {
          "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\Free_Test_Data_10.5MB_PDF.pdf",
          "FileName": "Free_Test_Data_10.5MB_PDF.pdf",
          "Checksum": "4684bd8c6e026748c38856f93369fbf944fa3d6c",
          "DateCreated": "2024-06-27T16:48:06.3139437-04:00",
          "DateModified": "2024-06-27T16:48:10.531114-04:00",
          "DateAccessed": "2024-07-15T19:09:13.1563378-04:00",
          "DateLastSaved": "2024-06-27T16:48:10.531114-04:00",
          "AssociatedProgramName": "Microsoft Edge",
          "Owner": "IDIR\\NSYED",
          "Computer": "VIRTUAL-MIND",
          "ContentType": "application/octet-stream",
          "SizeInBytes": 11081517
        },
        {
          "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\Free_Test_Data_15MB_MP4.mp4",
          "FileName": "Free_Test_Data_15MB_MP4.mp4",
          "Checksum": "1c55832910011beb386c934447f0d165d0a63e22",
          "DateCreated": "2024-06-27T16:35:45.5236385-04:00",
          "DateModified": "2024-06-27T16:35:49.5544384-04:00",
          "DateAccessed": "2024-07-15T19:09:13.2076519-04:00",
          "DateLastSaved": "2024-06-27T16:35:49.5544384-04:00",
          "AssociatedProgramName": "Windows Media Player Legacy",
          "Owner": "IDIR\\NSYED",
          "Computer": "VIRTUAL-MIND",
          "ContentType": "application/octet-stream",
          "SizeInBytes": 15791488
        },
        {
          "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\Free_Test_Data_1MB_DOCX-1.docx",
          "FileName": "Free_Test_Data_1MB_DOCX-1.docx",
          "Checksum": "d1b258080101ce7939219fa7e160e580b46004b8",
          "DateCreated": "2024-06-27T16:33:07.2437228-04:00",
          "DateModified": "2024-06-27T16:33:10.0615065-04:00",
          "DateAccessed": "2024-07-15T19:09:13.2155046-04:00",
          "DateLastSaved": "2024-06-27T16:33:10.0615065-04:00",
          "AssociatedProgramName": "WordPad",
          "Owner": "IDIR\\NSYED",
          "Computer": "VIRTUAL-MIND",
          "ContentType": "application/octet-stream",
          "SizeInBytes": 1055866
        },
        {
          "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\Free_Test_Data_1MB_XLSX.xlsx",
          "FileName": "Free_Test_Data_1MB_XLSX.xlsx",
          "Checksum": "8ff6edd002c9f6ec5c3a869f6146f555dd445c44",
          "DateCreated": "2024-06-27T16:39:39.6889969-04:00",
          "DateModified": "2024-06-27T16:39:42.2465345-04:00",
          "DateAccessed": "2024-07-15T19:09:13.2224612-04:00",
          "DateLastSaved": "2024-06-27T16:39:42.2465345-04:00",
          "AssociatedProgramName": "Pick an application",
          "Owner": "IDIR\\NSYED",
          "Computer": "VIRTUAL-MIND",
          "ContentType": "application/octet-stream",
          "SizeInBytes": 1059381
        },
        {
          "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\Ftd-20MB.mpeg",
          "FileName": "Ftd-20MB.mpeg",
          "Checksum": "12bf121a198be8b45f06b2cdae49418a396035d6",
          "DateCreated": "2024-06-27T16:34:02.1013395-04:00",
          "DateModified": "2024-06-27T16:34:16.9959043-04:00",
          "DateAccessed": "2024-07-15T19:09:13.299427-04:00",
          "DateLastSaved": "2024-06-27T16:34:16.9959043-04:00",
          "AssociatedProgramName": "Windows Media Player Legacy",
          "Owner": "IDIR\\NSYED",
          "Computer": "VIRTUAL-MIND",
          "ContentType": "application/octet-stream",
          "SizeInBytes": 21925888
        },
        {
          "Path": "C:\\Users\\NSYED\\Documents\\DATS\\folder1\\sample-zip.rar",
          "FileName": "sample-zip.rar",
          "Checksum": "d94275ca1db289b69f1ebe8171bcffd38802e17f",
          "DateCreated": "2024-06-27T16:48:35.6464112-04:00",
          "DateModified": "2024-06-27T16:48:42.4038437-04:00",
          "DateAccessed": "2024-07-15T19:09:13.3555647-04:00",
          "DateLastSaved": "2024-06-27T16:48:42.4038437-04:00",
          "AssociatedProgramName": "Windows Explorer",
          "Owner": "IDIR\\NSYED",
          "Computer": "VIRTUAL-MIND",
          "ContentType": "application/octet-stream",
          "SizeInBytes": 15501242
        }
      ];


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
        // Upload the technical metadata v2
        const jsonFileResponsedata = await s3ClientService.uploadTechnicalV2File(techMetadatav2json, psppath);



        console.log('all good');
        res.status(200).send('File uploaded and checksum verified');

      } else {
        // Handle checksum mismatch
        console.log('checksum mismatch');
        const transferService = new TransferService();
        transferService.deleteTransfer(transferId)
        res.status(400).send('Checksum mismatch');
      }

    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }

}



