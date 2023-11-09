import express from "express";

import DigitalFileListController from "../controller/digitalFileList-controller";
// import   TransferController from '@controller/transfer-controller'
// import { isAuthenticated } from '../middleware/is_auth'
const router = express.Router();
const digitalFileListController = new DigitalFileListController();
// DigitalFileLists Children
router
  .route("/digitalFileLists/:transferId/digitalFileLists")
  .get(digitalFileListController.getDigitalFileListsByTransferId)
  .post(digitalFileListController.createDigitalFileListByTransferId);

router
  .route("/transfers/:transferId/digitalFileLists/:digitalDatalistId")
  .delete(digitalFileListController.deleteDigitalDatalistFromTransfer)
  .post(digitalFileListController.updateDigitalFileList);

// ObjectDetails for DigitalFileLists Children

export default router;
