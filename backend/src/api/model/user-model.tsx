/**
 * @summary Type declaration for User
 * @author Jlevesqu
 */
import { model, Schema, Model, Document } from "mongoose";
import { IUser } from "./interfaces/IUser";
//import { Role as Roles } from "./enums/RolesEnum";

const UserSchema: Schema = new Schema<IUser>({
  guid: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  user_first_name: { type: String, required: true },
  user_last_name: { type: String, required: true },
  role: { type: String, required: true },

  // role: {
  //   type: String,
  //   enum: Roles,
  //   default: Roles.PRODUCER,
  //   required: true,
  // },
  created_at: { type: Date },
});

export const UserModel: Model<IUser> = model<IUser>("user", UserSchema);
