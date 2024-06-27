import express from "express";
import DigitalFileListController from "../controller/digitalFileList-controller";

const router = express.Router();
const digitalFileListController = new DigitalFileListController();

router
  .route("/transfers/:transferId/digitalFileLists")
  .get(digitalFileListController.getDigitalFileListsByTransferId)
  .post(digitalFileListController.createDigitalFileListByTransferId);

router
  .route("/transfers/:transferId/digitalFileLists/:digitalDatalistId")
  .delete(digitalFileListController.deleteDigitalDatalistFromTransfer)
  .put(digitalFileListController.updateDigitalFileList)
  .patch(digitalFileListController.updateDigitalFileList);

export default router;
