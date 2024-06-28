import express from "express";

import { uploadARIS66xMiddleware } from "../middleware/uploadARIS66xMiddleware";
import { uploadARIS617Middleware } from "../middleware/uploadARIS617Middleware";
import UploadController from "../controller/upload-controller";

const router = express.Router();
const uploadController = new UploadController();

router.post(
  "/uploadfileARIS66x",
  uploadARIS66xMiddleware,
  uploadController.handleARIS66xUpload
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

export default router;
