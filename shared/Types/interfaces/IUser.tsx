import { Types, Schema } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  guid: string;
  username: string;
  email: string;
  user_first_name: string;
  user_last_name: string;
  role: string;
  created_at: Date;
}
