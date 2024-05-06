import DigitalFileService from "../service/digitalFile-service";
import { Request, Response } from "express";

export default class DigitalFileController {
  private digitalFileService: DigitalFileService;

  constructor() {
    this.digitalFileService = new DigitalFileService();
    this.getDigitalFilesByDigitalFileListId =
      this.getDigitalFilesByDigitalFileListId.bind(this);
    this.createDigitalFileByDigitalFileListId =
      this.createDigitalFileByDigitalFileListId.bind(this);
  }
  async getDigitalFilesByDigitalFileListId(req: Request, res: Response) {
    try {
      const digitalDatalistId = req.params.digitalDatalistId;
      console.log(digitalDatalistId);
      const digitalLists =
        await this.digitalFileService.getDigitalFilesByDigitalFileListId(
          digitalDatalistId
        );
      if (!digitalLists) {
        return res.status(404).json({ error: "Digital File List not found" });
      }
      res.status(200).json(digitalLists);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
  async createDigitalFileByDigitalFileListId(req: Request, res: Response) {
    try {
      //   console.log(req.body);
      const digitalFileListId = req.params.digitalFileListId;
      console.log("digitalFileLidt Id : " + digitalFileListId);
      const digitalFile = req.body; // Assuming the transfer data is in the request body
      console.log(digitalFile);
      const createdDigitalFile =
        await this.digitalFileService.createDigitalFileByDigitalFileListId(
          digitalFileListId,
          digitalFile
        );
      res.status(201).json(createdDigitalFile);
    } catch (error) {
      res.status(500).json({ error: "An error occurred here" });
    }
  }
}
