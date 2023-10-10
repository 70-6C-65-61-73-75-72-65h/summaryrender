import { TYPES } from "./../../constants/index";
import { inject, injectable } from "inversify";
import UserInteractionsModel, {
  IUserInteractionsModel,
  IUserInteractionsDTO
} from "../../models/user-interactions";
import { Logger } from "winston";

export interface IUserInteractionsRepository {
  findUserByUserIP(
    ip: string,
    callingServiceName: string
  ): Promise<IUserInteractionsModel | null | undefined>;
  findUserInteractionsCountByUserIP(
    ip: string,
    callingServiceName: string
  ): Promise<number | null>;
  addNewUserInteraction(user: IUserInteractionsDTO): Promise<boolean | null>;
}

@injectable()
export class UserInteractionsRepository implements IUserInteractionsRepository {
  public constructor(@inject(TYPES.WinstonLogger) public logger: Logger) {}

  public async findUserByUserIP(
    ip: string,
    callingServiceName: string
  ): Promise<IUserInteractionsModel | null | undefined> {
    try {
      const userInteractions: IUserInteractionsModel | null =
        await UserInteractionsModel.findOne({ callingServiceName, userIP: ip });

      return userInteractions;
    } catch (error) {
      console.log(error);
      return undefined;
      //   if error - undefined
    }
  }

  public async findUserInteractionsCountByUserIP(
    ip: string,
    callingServiceName: string
  ): Promise<number | null> {
    const userInteractions = await this.findUserByUserIP(
      ip,
      callingServiceName
    );
    return userInteractions?.interactions ?? null;
  }

  public async addNewUserInteraction(
    user: IUserInteractionsDTO // for each new request to set from another api we just get user ip and calling service name
  ): Promise<boolean | null> {
    try {
      let result = await UserInteractionsModel.updateOne(
        {
          userIP: user.userIP,
          callingServiceName: user.callingServiceName
        },
        { $inc: { interactions: 1 } },
        { upsert: true }
      );
      return !!result.upsertedCount;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
