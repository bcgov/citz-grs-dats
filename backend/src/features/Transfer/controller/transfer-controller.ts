import { TransferService } from "../service/transfer-service";
import { Request, Response } from "express";
import { validationResult, param } from "express-validator";
import {
  transferCreateValidation,
  transferUpdateValidation,
} from "./validators/transfer-validators";

// const getTransfers = (req: Request, res: Response): void => {
//     res.json(req.user);
// };
// export default {
//     getTransfers,
// };

export default class TransferController {
  private transferService: TransferService;

  constructor() {
    this.transferService = new TransferService();
    this.getTransfers = this.getTransfers.bind(this);
    this.getTransferById = this.getTransferById.bind(this);
    this.createTransfer = this.createTransfer.bind(this);
    this.updateTransfer = this.updateTransfer.bind(this);
    this.deleteTransfer = this.deleteTransfer.bind(this);
    this.getTransferByKeysNumbers = this.getTransferByKeysNumbers.bind(this);
    this.getSearchTransfers = this.getSearchTransfers.bind(this);

    // Bind the function to the current instance
  }

  /**
   * @swagger
   * definitions:
   *   Transfer:
   *     properties:
   *       id:
   *         type: UUID
   *         description: The user ID.
   *         example: 64e51c94afdb3632eaa02911
   *       accessionNumber:
   *         type: string
   *         description: the Accession number.
   *         example: 94-1434
   *       applicationNumber:
   *         type: string
   *         description: the Application number.
   *         example: 225495
   *       description:
   *         type: string
   *         description: the Description of the transfer.
   *         example: this is the Emails of the President jl
   *       scheduleNumber:
   *         type: string
   *         description: the Schedule Number of the transfer.
   *         example: this is the Emails of the President
   *       descriptionOfRecords:
   *         type: string
   *         description: the description Of the Records in the transfer.
   *         example: this is the Emails of the President
   */

  /**
   * @swagger
   * /transfers:
   *   get:
   *     summary: Retrieve a list of DATS Transfers
   *     description: Retrieve a list of Transfers from DATS.
   *     responses:
   *       200:
   *         description: A list of transfers.
   *         content:
   *           application/json:
   *             schema:
   *               properties:
   *                 trandfers:
   *                   type: array
   *                   items:
   *                     $ref: '#/definitions/Transfer'
   */
  async getTransfers(req: Request, res: Response) {
    try {
      const transfers = await this.transferService.getTransfers();
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }

  /**
   * @swagger
   * /transfers/{transferId}:
   *   get:
   *     summary: Retrieve a single transfer of DATS
   *     description: Retrieve a single transfer of DATS.
   *     parameters:
   *     - name: transferId
   *       in: path
   *       description: Transfer ID
   *       required: true
   *       schema:
   *         type: string
   *     responses:
   *       200:
   *         description: A Single transfer.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/Transfer'
   */
  async getTransferById(req: Request, res: Response) {
    try {
      const transferId = req.params.transferId;
      const transfer = await this.transferService.getTransferById(transferId);
      if (!transfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      res.json(transfer);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }

  async getTransferByKeysNumbers(req: Request, res: Response) {
    try {
      console.log("getTransferByKeysNumbers");
      const { accessionNumber, applicationNumber } = req.params;
      const transfer = await this.transferService.getTransferByKeysNumbers(
        accessionNumber,
        applicationNumber
      );

      if (!transfer) {
        res.status(404).json({ error: "Transfer not found" });
      }

      res.json(transfer);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }

  async getSearchTransfers(req: Request, res: Response) {
    try {
      const transferFilters = req.body;
      const transfers = await this.transferService.getSearchTransfers(
        transferFilters
      );
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }

  /**
   * @swagger
   * /transfers:
   *   post:
   *     summary: Create a single transfer of DATS.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - accessionNumber
   *               - applicationNumber
   *             properties:
   *               accessionNumber:
   *                 type: string
   *                 description: the Accession number.
   *                 example:  94-1434
   *               applicationNumber:
   *                 type: string
   *                 description: the Application number.
   *                 example:  225495
   *               description:
   *                 type: string
   *                 description: a short description.
   *                 example:  the Description of the new transfer
   *     responses:
   *       201:
   *         description: A Single transfer.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/definitions/Transfer'
  
   */

  async createTransfer(req: Request, res: Response) {
    try {
      // Create a validation chain for request body fields
      // Run the validation chain
      await Promise.all(
        transferCreateValidation.map((validation) => validation.run(req))
      );

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const transfer = req.body;
      const createdTransfer = await this.transferService.createTransfer(
        transfer
      );
      res.status(201).json(createdTransfer);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }

  async updateTransfer(req: Request, res: Response) {
    try {
      // param("transferId").exists().isMongoId();
      await Promise.all(
        transferUpdateValidation.map((validation) => validation.run(req))
      );

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const transferId = req.params.transferId;
      const updatedTransferData = req.body; // Assuming the updated data is in the request body
      console.log(transferId);
      console.log(updatedTransferData);
      const updatedTransfer = await this.transferService.updateTransfer(
        transferId,
        updatedTransferData
      );
      if (!updatedTransfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      res.json(updatedTransfer);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }

  async deleteTransfer(req: Request, res: Response) {
    try {
      const transferId = req.params.transferId; // Assuming the parameter is named 'transferId' in the route
      const deletedTransfer = await this.transferService.deleteTransfer(
        transferId
      );
      if (!deletedTransfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }
      res.json({ message: "Transfer deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }
}
