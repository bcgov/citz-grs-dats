import express from "express";

import UploadController from "../controller/upload-controller";
import { uploadARIS66xMiddleware } from "../middleware/uploadARIS66xMiddleware";
import { uploadARIS617Middleware } from "../middleware/uploadARIS617Middleware";

const router = express.Router();
const uploadController = new UploadController();

router.post(
  "/uploadfileARIS66x",
  uploadARIS66xMiddleware,
  uploadController.handleARIS66xUpload
);
router.post(
  "/uploadfileARIS617",
  uploadARIS617Middleware,
  uploadController.handleARIS617Upload
);

router.get("/checkAccessibility", uploadController.checkAccessibility);
// router.post('/create', isAuthenticated, createUser)
export default router;
