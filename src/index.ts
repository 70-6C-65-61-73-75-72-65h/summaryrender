import "reflect-metadata";
import morgan from "morgan";
import cors from "cors";
import swaggerUi, { JsonObject } from "swagger-ui-express";
import * as express from "express";
import {
  createLogger,
  format,
  transports,
  Logger,
  LoggerOptions
} from "winston";
import { Request, Response, NextFunction } from "express";
import { InversifyExpressServer } from "inversify-express-utils";
import { Container } from "inversify";
import * as bodyParser from "body-parser";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { Format, TransformableInfo } from "logform";
import { TYPES } from "./constants";
import { IMailerService, MailerService } from "./services/mailer";
import * as yaml from "js-yaml";
import { MongoDbService, IMongoDbService } from "./services/mongodb";
import "./controllers/health";
import "./controllers/reports";
import {
  IUserInteractionsRepository,
  UserInteractionsRepository
} from "./repositories/user-interactions";
import { IReporterService, ReporterService } from "./services/reporter";

dotenv.config({ path: "./.env" });

const fmt: Format = format.printf((info: TransformableInfo) => {
  return `[${info["timestamp"]} ${info.level}]: ${info.message}`;
});

const logger: Logger = createLogger(<LoggerOptions>{
  level: "debug",
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    fmt
  ),
  transports: [
    new transports.Console({ level: "info" })
    // new transports.File({ filename: 'sample-app.log' }),
  ]
});

(async () => {
  const container = new Container();

  container.bind<Logger>(TYPES.WinstonLogger).toConstantValue(logger);
  container
    .bind<IMailerService>(TYPES.MailerService)
    .to(MailerService)
    .inSingletonScope();
  container
    .bind<IUserInteractionsRepository>(TYPES.UserInteractionsRepository)
    .to(UserInteractionsRepository)
    .inSingletonScope();
  container
    .bind<IReporterService>(TYPES.ReporterService)
    .to(ReporterService)
    .inSingletonScope();
  container
    .bind<IMongoDbService>(TYPES.MongoDbService)
    .to(MongoDbService)
    .inSingletonScope();

  const mongodb = container.get<IMongoDbService>(TYPES.MongoDbService);
  await mongodb.connectDb();

  // const workerService = container.get<WorkerService>(TYPES.WorkerService);
  // workerService.startWorker();

  const server = new InversifyExpressServer(container);

  server.setConfig(async (app) => {
    app.use(cors());
    app.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    app.use(bodyParser.json());
    const swaggerContent = await new Promise<string>((resolve, reject) => {
      fs.readFile(
        path.resolve(process.cwd(), "src/swagger/swagger.yaml"),
        "utf8",
        (err, content) => {
          if (err) {
            return reject(err);
          }
          return resolve(content);
        }
      );
    });

    const swaggerDoc = yaml.load(swaggerContent) as JsonObject;
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
    app.use(morgan("dev"));
  });

  server.setErrorConfig((app) => {
    app.use(
      async (err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error(err);
        res.status(400).send(err);
      }
    );
  });

  const instance = server.build();
  instance.listen(process.env.APP_PORT || 5000);
  // log to the console to indicate the server has been started
  logger.info(`Server is listening on port ${process.env.APP_PORT}`);
})();

// listen to all the unhandled rejection
process.on("unhandledRejection", (reason, promise) => {
  if (!reason) {
    logger.crit(
      "No reason for the failure, please investigate all the potential possibilities that is causing the error"
    );
  } else {
    logger.error(reason);
  }
});
