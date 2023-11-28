import express from "express";

import UploadController from "../controller/upload-controller";
import { uploadARIS66xMiddleware } from "../middleware/uploadARIS66xMiddleware";
import { uploadARIS617Middleware } from "../middleware/uploadARIS617Middleware";

const router = express.Router();

router.post(
  "/uploadfileARIS66x",
  uploadARIS66xMiddleware,
  UploadController.handleARIS66xUpload
);
router.post(
  "/uploadfileARIS617",
  uploadARIS617Middleware,
  UploadController.handleARIS617Upload
);
// router.post('/create', isAuthenticated, createUser)
export default router;
