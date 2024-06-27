
import { Request, Response } from "express";
import { UserService } from "src/service";

export default class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }
  /**
   * @summary Gets a user by their guid
   * @author Jlevesque
   */
  async getUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  }
}
