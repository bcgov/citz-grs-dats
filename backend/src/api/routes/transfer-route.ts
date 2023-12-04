import express from "express";

import TransferController from "../controller/transfer-controller";
// import   TransferController from '@controller/transfer-controller'
// import { isAuthenticated } from '../middleware/is_auth'
const router = express.Router();
const transferController = new TransferController();

// Define routes for handling transfer-related requests

// Route for getting all transfers
router
  .route("/transfers")
  .get(transferController.getTransfers)
  .post(transferController.createTransfer);
// router.post('/create', isAuthenticated, createUser)
router
  .route("/transfers/:transferId")
  .get(transferController.getTransferById)
  .delete(transferController.deleteTransfer)
  .put(transferController.updateTransfer)
  .patch(transferController.updateTransfer);

// router
//   .route("/transfers/:accessionNumber/:applicationNumber")
//   .get(transferController.getTransferByKeysNumbers);

router
  .route("/transfers/search")
  .get(transferController.getSearchTransfers)
  .post(transferController.getSearchTransfers);

export default router;
