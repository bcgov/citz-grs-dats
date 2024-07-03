import TransferController from "../controller/transfer-controller";
import express from "express";

const router = express.Router();
const transferController = new TransferController();

router
  .route("/transfers")
  .get(transferController.getTransfers)
  .post(transferController.createTransfer);

router
  .route("/transfers/:transferId")
  .get(transferController.getTransferById)
  .delete(transferController.deleteTransfer)
  .put(transferController.updateTransfer)
  .patch(transferController.updateTransfer);

router
  .route("/transfers/search")
  .get(transferController.getSearchTransfers)
  .post(transferController.getSearchTransfers);

router.get('/transfer/:accessionNumber/:applicationNumber', (req, res) => transferController.getTransferByKeysNumbers(req, res));



export default router;
