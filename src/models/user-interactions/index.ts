import { Schema, Model, model, Document } from "mongoose";

export interface IUserInteractionsDTO {
  userIP: string;
  callingServiceName: string;
}

export interface IUserInteractionsModel extends Document, IUserInteractionsDTO {
  interactions?: number;
}

const userSchema: Schema = new Schema({
  userIP: { type: String, required: true, unique: true },
  callingServiceName: { type: String, required: true },
  interactions: { type: Number, default: 0 }
});

const UserInteractionsModel: Model<IUserInteractionsModel> =
  model<IUserInteractionsModel>("UserInteractionsModel", userSchema);
export default UserInteractionsModel;
