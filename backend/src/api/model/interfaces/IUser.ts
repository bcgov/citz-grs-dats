import { Types, Schema } from "mongoose";
import { Role } from "../Enums/RolesEnum";

export interface IUser {
  _id: Types.ObjectId;
  guid: string;
  username: string;
  email: string;
  user_first_name: string;
  user_last_name: string;
  role: Role;
  created_at: Date;
}
