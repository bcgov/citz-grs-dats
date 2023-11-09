import express from "express";

import DigitalFileController from "../controller/digitalFile-controller";

const router = express.Router();
const digitalFileController = new DigitalFileController();
// DigitalFileLists Children
router
  .route("/digitalFileLists/:digitalFileListId/digitalFiles")
  .get(digitalFileController.getDigitalFilesByDigitalFileListId)
  .post(digitalFileController.createDigitalFileByDigitalFileListId);
export default router;
