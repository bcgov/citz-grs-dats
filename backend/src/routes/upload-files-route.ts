import express from "express";

import { uploadARIS66xMiddleware } from "../middleware/uploadARIS66xMiddleware";
import { uploadARIS617Middleware } from "../middleware/uploadARIS617Middleware";
import UploadController from "../controller/upload-controller";
import { uploadFolderDetails } from "../middleware/uploadFolderDetails";
import multer from "multer";
import { uploadFileToS3 } from "../middleware/uploadFileToS3";

const router = express.Router();
const uploadController = new UploadController();
const storage = multer.memoryStorage();

// Create multer upload instance
const upload = multer({ storage: storage });
router.post(
  "/uploadfileARIS66x",
  uploadARIS66xMiddleware,
  uploadController.handleARIS66xUpload
);
router.post(
  "/uploadDataportFile",
  upload.single('file'),
  uploadController.handleARIS66xCsvUpload
);

router.get(
  "/get66xFileTransferInfos",
  uploadController.get66xFileTransferInfos
);

router.post(
  "/uploadfileARIS617",
  uploadARIS617Middleware,
  uploadController.handleARIS617Upload
);

router
  .route("/submitAgreement")
  .post(uploadController.saveSubmitAgreement);

router.get(
  "/downloadUpdateAris662",
  uploadController.downloadUpdateAris662);

router.post(
  "/upload-files",
  uploadFolderDetails,
  uploadController.saveFolderDetails);

router.post(
  "/upload-files-toS3Documentation",
  uploadFileToS3,
  uploadController.saveToS3Documentation);

export default router;
