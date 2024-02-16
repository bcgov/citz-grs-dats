import DigitalFileListService from "../service/digitalFileList-service";
import { Request, Response } from "express";

export default class DigitalFileListController {
  private digitalFileListService: DigitalFileListService;

  constructor() {
    this.digitalFileListService = new DigitalFileListService();

    this.getDigitalFileListsByTransferId =
      this.getDigitalFileListsByTransferId.bind(this);
    this.createDigitalFileListByTransferId =
      this.createDigitalFileListByTransferId.bind(this);
    this.deleteDigitalDatalistFromTransfer =
      this.deleteDigitalDatalistFromTransfer.bind(this);
    this.updateDigitalFileList = this.updateDigitalFileList.bind(this);
    // Bind the function to the current instance
  }
  // DigitalFileLists Children
  async getDigitalFileListsByTransferId(req: Request, res: Response) {
    try {
      const transferId = req.params.transferId; // Assuming the parameter is named 'transferId' in the route
      console.log("in getDigitalFileListsByTransferId" + transferId);
      const digitalFileLists =
        await this.digitalFileListService.getDigitalFileListsByTransferId(
          transferId
        );
      if (!digitalFileLists) {
        return res.status(404).json({ error: "Digital File List not found" });
      }
      res.status(200).json(digitalFileLists);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
  async createDigitalFileListByTransferId(req: Request, res: Response) {
    try {
      //   console.log(req.body);
      const transferId = req.params.transferId;
      console.log("Transfer Id : " + transferId);
      const digitalFileList = req.body; // Assuming the transfer data is in the request body
      console.log(digitalFileList);
      const createdDigitalFileList =
        await this.digitalFileListService.createDigitalFileListByTransferId(
          transferId,
          digitalFileList
        );
      res.status(201).json(createdDigitalFileList);
    } catch (error) {
      res.status(500).json({ error: "An error occurred here" });
    }
  }
  async deleteDigitalDatalistFromTransfer(req: Request, res: Response) {
    try {
      const { transferId, digitalDatalistId } = req.params; // Assuming the parameter is named 'transferId' in the route

      console.log("Transfer Id : " + transferId);
      console.log("digitalDatalistId Id : " + digitalDatalistId);
      const deleteddigitalDatalist =
        await this.digitalFileListService.deleteDigitalDatalistFromTransfer(
          transferId,
          digitalDatalistId
        );
      console.log("deleteddigitalDatalist Id : " + deleteddigitalDatalist);
      if (!deleteddigitalDatalist) {
        return res.status(404).json({ error: "Digital Data list not found" });
      }
      return res.status(200).json({
        message:
          "Digital Data list deleted successfully" + digitalDatalistId + " ",
      });
    } catch (error) {
      console.log("ERROR Id : in catch ");
      res.status(500).json({ error: "An error occurred" });
    }
  }
  async updateDigitalFileList(req: Request, res: Response) {
    try {
      const digitalDatalistId = req.params.digitalDatalistId; // Assuming the parameter is named 'transferId' in the route
      const updatedDigitalFileListData = req.body; // Assuming the updated data is in the request body
      const updatedDigitalFileList =
        await this.digitalFileListService.updateDigitalFileList(
          digitalDatalistId,
          updatedDigitalFileListData
        );
      if (!updatedDigitalFileList) {
        return res.status(404).json({ error: "Digital File List not found" });
      }
      res.status(200).json(updatedDigitalFileList);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }
}
