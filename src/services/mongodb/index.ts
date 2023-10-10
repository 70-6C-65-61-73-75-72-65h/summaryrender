import { TYPES } from "../../constants";
import { inject, injectable } from "inversify";
import { Logger } from "winston";
import {
  set,
  connect,
  connection,
  Connection,
  MongooseOptions
} from "mongoose";

export interface IMongoDbService {
  getConnectionString(): string;
  connectDb(): Promise<void>;
  getClient(): Connection;
}

@injectable()
export class MongoDbService implements IMongoDbService {
  private client: Connection;
  private logger: Logger;

  public constructor(@inject(TYPES.WinstonLogger) logger: Logger) {
    this.logger = logger;
    this.client = connection;
    // register the listener
    this.client.on("connected", () => {
      this.logger.info(
        `Successfully connected to MongoDB at host: ${process.env.MONGO_DB_HOST}, port: ${process.env.MONGO_DB_PORT}, database: ${process.env.MONGO_DB_NAME}`
      );
    });
    this.client.on("disconnected", () => {
      this.logger.warn("MongoDB disconnected");
    });
    this.client.on("error", (err: Error) => {
      this.logger.error(
        `MongoDB connection is dropped due to the following error: ${err}`
      );
    });
  }

  public getConnectionString(): string {
    if (process.env.MONGODB_ENDPOINT) {
      return process.env.MONGODB_ENDPOINT;
    } else {
      return `mongodb://${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT}/${process.env.MONGO_DB_NAME}`;
    }
  }

  public async connectDb(): Promise<void> {
    await connect(this.getConnectionString());
    this.logger.info("MongoDB connected...");
  }

  public getClient(): Connection {
    return this.client;
  }
}
