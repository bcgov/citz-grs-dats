import express from "express";

import DigitalFileListController from "../controller/digitalFileList-controller";
// import   TransferController from '@controller/transfer-controller'
// import { isAuthenticated } from '../middleware/is_auth'
const router = express.Router();
const digitalFileListController = new DigitalFileListController();
// DigitalFileLists Children
router
  .route("/transfers/:transferId/digitalFileLists")
  .get(digitalFileListController.getDigitalFileListsByTransferId)
  .post(digitalFileListController.createDigitalFileListByTransferId);

router
  .route("/transfers/:transferId/digitalFileLists/:digitalDatalistId")
  .delete(digitalFileListController.deleteDigitalDatalistFromTransfer)
  .put(digitalFileListController.updateDigitalFileList)
  .patch(digitalFileListController.updateDigitalFileList);

// router.route("/digitalFileLists/upload66x").post(digitalFileListController);

export default router;
