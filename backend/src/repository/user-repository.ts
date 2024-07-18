import { UserModel } from "../models/user-model";
import { IUser } from "../models/interfaces/IUser";

export default class UserRepository {
  constructor() { }

  async getUsers(): Promise<IUser[] | null> {
    const users = await UserModel.find({});
    console.log("users:::", users);
    return users;
  }
  async getUserById(userId): Promise<IUser | null> {
    const user = await UserModel.findById(userId);
    console.log("user:::", user);
    return user;
  }
}
