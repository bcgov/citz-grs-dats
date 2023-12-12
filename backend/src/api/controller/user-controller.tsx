import { Request, Response } from "express";
import UserService from "../service/user-service";
import { KeycloakUser, KeycloakIdirUser } from "@bcgov/citz-imb-kc-express";
import httpResponses from "../../utils/httpResponse";

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

/**
 * @summary Creates or updates user data
 * @author dallascrichmond
 */
export const upsertUser = async (userData: KeycloakUser & KeycloakIdirUser) => {
  const newUser = {
    guid: userData.idir_user_guid,
    username: userData.idir_username,
    email: userData.email,
    user_first_name: userData.given_name,
    user_last_name: userData.family_name,
    roles: userData.client_roles ?? [],
  };
  try {
    // await userService. .user.upsert({
    //   where: {
    //     guid: userData.idir_user_guid,
    //   },
    //   create: newUser,
    //   update: newUser,
    // });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: ", error);
  }
};
