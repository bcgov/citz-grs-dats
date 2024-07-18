import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";;
import extractsFromAra66x from "../utils/extractsFromAra66x";
import fs from "fs";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import path from "path";

export default class S3ClientService {

    private s3Client: S3Client;
    private documentationPath: string;

    constructor() {
        this.documentationPath = "";
        // Create an S3 client
        this.s3Client = new S3Client({
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIA1DCC49EEEA5B8094',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'hL2ZqW2+0poPdw2FABeKy9ux4iSMTqceEQ+8JNxr',
            },
            endpoint: process.env.AWS_ENDPOINT || 'https://citz-grs-dats.objectstore.gov.bc.ca', // Custom endpoint
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
            const allFolders = await this.listFolders();
            if (allFolders.includes(folderPath)) return;

            const createFolderCommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
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
        const fileContent = fs.readFileSync(uploadedFilePath);

        //Create the Transfer Root Folder
        var transferFolderPath = process.env.TRANSFER_FOLDER_NAME || 'Transfers';
        transferFolderPath = transferFolderPath + "/";
        this.createFolder(transferFolderPath);

        //create sub folders in Transfers
        let transferData = await extractsFromAra66x(uploadedFile.path);
        const accession_num = transferData?.accession;
        const application_num = transferData?.application;
        const subApplicationPath = transferFolderPath + accession_num + "-" + application_num + "/";
        this.createFolder(subApplicationPath);


        //Create the Documentation folder
        const subDocPath = subApplicationPath + "Documentation/";
        this.createFolder(subDocPath);
        const metaDataPath = subApplicationPath + "Metadata/";
        this.createFolder(metaDataPath);
        // const contentsPath = subApplicationPath + "Contents/";
        // this.createFolder(contentsPath);

        const targetFilePath = subDocPath + uploadedFile.originalname;

        try {
            const uploadFilecommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: targetFilePath, // File path within the folder
                Body: fileContent, //uploadedFile.buffer, //file.buffer, // File content
            });

            const data = await this.s3Client.send(uploadFilecommand);
            fs.unlinkSync(uploadedFilePath);

        } catch (error) {
            console.error('Error uploading file', error);
        }

        this.documentationPath = subDocPath;
        return subDocPath;
    }

    async uploadARIS617File(
        uploadedFile: Express.Multer.File,
        documentationPath: string
    ) {
        const uploadedFilePath = uploadedFile.path;
        console.log("---------->uploadARIS617FilePath=" + uploadedFilePath);
        const fileContent = fs.readFileSync(uploadedFilePath);

        const targetFilePath = documentationPath + uploadedFile.originalname;

        try {
            const uploadFilecommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
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
        pdfBuffer: Buffer,
        targetPdfFilePath: string
    ) {
        console.log("--------->targetPdfFilePath=" + targetPdfFilePath);
        const targetFilePath = targetPdfFilePath;

        try {
            const uploadFilecommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: targetPdfFilePath, // File path within the folder
                Body: pdfBuffer, // File content as buffer
            });

            const data = await this.s3Client.send(uploadFilecommand);
            console.log('File uploaded successfully', data);
        } catch (error) {
            console.error('Error uploading file', error);
            throw error;
        }
    }

    async uploadZipFile(
        uploadedZipFile: Express.Multer.File,
        applicationNumber: string,
        accessionNumber: string,
        primarySecondary: string,
        checksumstring: string,
        psppath: string,
    ) {
        //var transferFolderPath = process.env.TRANSFER_FOLDER_NAME || 'Transfers';
        const orginalname = uploadedZipFile.originalname;

        const filename = orginalname.substring(0, orginalname.indexOf(".zip"));
        const transferFolderPath = psppath + "Content/" + filename;
        this.createFolder(transferFolderPath);
        // transferFolderPath = psppath +"/Documentation/";
        // this.createFolder(transferFolderPath);
        const zipFilePath = transferFolderPath + "/" + orginalname;
        //const filename = orginalname.substring(0, orginalname.indexOf(".zip"));
        const jsonFileName = filename + "_checksum.json";
        const checksumPath = transferFolderPath + "/" + jsonFileName;
        const jsonBuffer = JSON.stringify(checksumstring);
        console.log("----------->transferFolderPath=" + transferFolderPath);
        console.log("----------->zipFilePath=" + zipFilePath);
        console.log("----------->checksumPath=" + checksumPath);

        try {
            const uploadFilecommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: zipFilePath, // File path within the folder
                Body: uploadedZipFile.buffer,
            });

            const zipFileResponsedata = await this.s3Client.send(uploadFilecommand);
            console.log("----------->zipFileResponsedata =" + zipFileResponsedata);
            const uploadJSONcommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: checksumPath,
                Body: jsonBuffer,
                ContentType: 'application/json'
            });
            const jsonFileResponsedata = await this.s3Client.send(uploadJSONcommand);

        } catch (error) {
            console.error('Error uploading file', error);
        }

        return zipFilePath;
    }
    async uploadTechnicalV2File(techMetadatav2: any, psppath: string) {
        const transferFolderPath = psppath + "Metadatas/";
        this.createFolder(transferFolderPath);
        console.log("----------->uploadTechnicalV2File=" + transferFolderPath);
        const jsonBuffer = Buffer.from(JSON.stringify(techMetadatav2));
        console.log("----------->uploadTechnicalV2File=" + jsonBuffer);

        try {
            const uploadJSONcommand = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Key: transferFolderPath + 'techMetadatav2.json',
                Body: jsonBuffer,
                ContentType: 'application/json'
            });
            const jsonFileResponsedata = await this.s3Client.send(uploadJSONcommand);
            console.log("----------->jsonFileResponsedata=" + jsonFileResponsedata);
        } catch (error) {
            console.error('Error uploading file', error);
        }

        return transferFolderPath;

    }

    async deleteFolder(folderPath: string) {
        try {
            // List all objects in the folder
            const listObjectsCommand = new ListObjectsV2Command({
                Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                Prefix: folderPath,
            });
            const data = await this.s3Client.send(listObjectsCommand);

            // Delete each object in the folder
            if (data.Contents) {
                for (const object of data.Contents) {
                    if (object.Key) {
                        const deleteObjectCommand = new DeleteObjectCommand({
                            Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
                            Key: object.Key,
                        });
                        await this.s3Client.send(deleteObjectCommand);
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting folder', error);
        }
    }

    async listObjects(prefix: string): Promise<string[]> {
        const command = new ListObjectsV2Command({
            Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
            Prefix: prefix,
        });

        try {
            const response = await this.s3Client.send(command);
            if (response.Contents) {
                return response.Contents.map(obj => obj.Key || "");
            }
            return [];
        } catch (error) {
            console.error("Error listing objects:", error);
            throw error;
        }
    }

    async downloadFile(key: string, downloadPath: string): Promise<void> {
        const command = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
            Key: key,
        });

        try {
            const response = await this.s3Client.send(command);
            if (response.Body) {
                const nodeStream = response.Body as Readable;
                const fileStream = fs.createWriteStream(downloadPath);
                await pipeline(nodeStream, fileStream);
            } else {
                throw new Error("Body is undefined in S3 response.");
            }
        } catch (error) {
            console.error("Error downloading file:", error);
            throw error;
        }
    }
    async deleteObject(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: process.env.BUCKET_NAME || 'dats-bucket-dev',
            Key: key,
        });

        try {
            await this.s3Client.send(command);
        } catch (error) {
            console.error("Error deleting object:", error);
            throw error;
        }
    }

}
