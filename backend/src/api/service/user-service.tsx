import UserRepository from "../repository/user-repository";
import { IUser } from "../model/interfaces/IUser";

export default class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUsers(): Promise<IUser[] | null> {
    return await this.userRepository.getUsers();
  }
  async getUserById(UserId): Promise<IUser | null> {
    return await this.userRepository.getUserById(UserId);
  }
}
