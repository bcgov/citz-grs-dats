import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";;
import extractsFromAra66x from "../utils/extractsFromAra66x";
import fs from "fs";

export default class S3ClientService {

    private s3Client: S3Client;
    private documentationPath: string;

    constructor() {
        this.documentationPath="";
        // Create an S3 client
        this.s3Client=new S3Client({
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIA1DCC49EEEA5B8094',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'hL2ZqW2+0poPdw2FABeKy9ux4iSMTqceEQ+8JNxr',
            },
            endpoint: 'https://citz-grs-dats.objectstore.gov.bc.ca', // Custom endpoint
            forcePathStyle: true, // Use path-style URLs (required for some custom S3 providers)
          });
      }

    async listFolders() {
      try {

        const listcommand = new ListObjectsV2Command({
            Bucket: 'dats-bucket-dev',
            Delimiter: '/', // Use delimiter to group objects by folder
        });
 
        const data = await this.s3Client.send(listcommand);
        const folders = data.CommonPrefixes?.map(prefix => prefix.Prefix) || [];
        return folders;

      } catch (error) {
        console.error('Error listing folders', error);
      }

      return [];
    }

   async createFolder(
        folderPath: string
   ) {
    try {
        const createFolderCommand = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME||'dats-bucket-dev',
            Key: folderPath, // Folder key ends with '/'
        });
 
        const data = await this.s3Client.send(createFolderCommand);
        
      } catch (error) {
        console.error('Error creating folder', error);
      }
    }

    async uploadAra66xFile(
        uploadedFile: any 
    ) {
        const uploadedFilePath = uploadedFile.path;
        console.log("---------->uploadAra66xFilePath="+uploadedFilePath);
        const fileContent = fs.readFileSync(uploadedFilePath);

        //Create the Transfer Root Folder
        var transferFolderPath=process.env.TRANSFER_FOLDER_NAME||'Transfers';
        transferFolderPath=transferFolderPath+"/";
        const folders= await this.listFolders();
        if(!folders.includes(transferFolderPath)) {
             this.createFolder(transferFolderPath);
        }
  
        //create sub folders in Transfers
        let transferData = await extractsFromAra66x(uploadedFile.path);
        const accession_num=transferData?.accession;
        const application_num=transferData?.application;
        const subApplicationPath = transferFolderPath+accession_num+"-"+application_num+"/";
        this.createFolder(subApplicationPath);

        
        //Create the Documentation folder
        const subDocPath = subApplicationPath+"Documentation/";
        this.createFolder(subDocPath);

        const targetFilePath=subDocPath+uploadedFile.originalname;

        try {
            const uploadFilecommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME||'dats-bucket-dev',
                Key: targetFilePath, // File path within the folder
                Body: fileContent, //uploadedFile.buffer, //file.buffer, // File content
            });
     
            const data = await this.s3Client.send(uploadFilecommand);
            fs.unlinkSync(uploadedFilePath);

        } catch (error) {
            console.error('Error uploading file', error);
        } 

        this.documentationPath=subDocPath;
        return subDocPath;
    }

    async uploadARIS617File(
         uploadedFile: Express.Multer.File,  
         documentationPath: string
    ) {
        const uploadedFilePath = uploadedFile.path;
        console.log("---------->uploadARIS617FilePath="+uploadedFilePath);
        const fileContent = fs.readFileSync(uploadedFilePath);

        const targetFilePath=documentationPath+uploadedFile.originalname;
        
        try {
            const uploadFilecommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME||'dats-bucket-dev',
                Key: targetFilePath, // File path within the folder
                Body: fileContent, //uploadedFile.buffer, //file.buffer, // File content
            });
     
            const data = await this.s3Client.send(uploadFilecommand);
            fs.unlinkSync(uploadedFilePath);

        } catch (error) {
            console.error('Error uploading file', error);
        } 

        return documentationPath;
    }

    async uploadAgreementPDF(
        pdfFilePath: string,  
        targetPdfFilePath: string
   ) {
       console.log("---------->pdfFilePath="+pdfFilePath);
       const fileContent = fs.readFileSync(pdfFilePath);

       console.log("--------->targetPdfFilePath="+targetPdfFilePath);
       const targetFilePath=targetPdfFilePath;
       
       try {
           const uploadFilecommand = new PutObjectCommand({
               Bucket: process.env.BUCKET_NAME||'dats-bucket-dev',
               Key: targetFilePath, // File path within the folder
               Body: fileContent, //uploadedFile.buffer, //file.buffer, // File content
           });
    
           const data = await this.s3Client.send(uploadFilecommand);
           //fs.unlinkSync(pdfFilePath);

       } catch (error) {
           console.error('Error uploading file', error);
       } 
   }



}
