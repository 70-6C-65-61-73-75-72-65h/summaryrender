import { TYPES } from "./../../constants/index";
import { injectable, inject } from "inversify";
import { IUserInteractionsRepository } from "repositories/user-interactions";
import { Worker } from "worker_threads";
import { Logger } from "winston";

export interface IReportData {
  interactions: number;
}

export interface IReporterService {
  generatePDFFromReportTemplate(
    userIP: string,
    callingServiceName: string
  ): Promise<string>;
  getUserRequestsCount(
    userIP: string,
    callingServiceName: string
  ): Promise<number>;
  setUserRequestsCount(
    userIP: string,
    callingServiceName: string
  ): Promise<boolean>;
}

@injectable()
export class ReporterService implements IReporterService {
  public constructor(
    @inject(TYPES.UserInteractionsRepository)
    public userInteractionsRepo: IUserInteractionsRepository,
    @inject(TYPES.WinstonLogger)
    public logger: Logger
  ) {}

  public async generatePDFFromReportTemplate(
    userIP: string,
    callingServiceName: string
  ): Promise<string> {
    const interactions = await this.getUserRequestsCount(
      userIP,
      callingServiceName
    );

    const res: any = await new Promise((resolve, reject) => {
      const worker = new Worker("./src/services/reporter/worker.js");

      worker.on("message", (message) => {
        resolve(message);
      });
      worker.on("error", (message) => {
        this.logger.error("error");
        this.logger.error(JSON.stringify(message));
        reject(message);
      });
      worker.on("exit", (message) => {
        this.logger.info("exit");
        this.logger.info(JSON.stringify(message));
      });

      worker.postMessage({
        callingServiceName,
        userIP,
        interactions
      }); //, logger: this.logger
    });

    // const res = await this.workerService.runWorker({
    //   callingServiceName,
    //   userIP,
    //   interactions
    // });

    if (!res.filename) {
      console.log("\n\nno filename in result after report generated\n\n");
      // ... throw  new Error()
    }
    return res.filename;
  }

  public async getUserRequestsCount(
    userIP: string,
    callingServiceName: string
  ): Promise<number> {
    const userInteractions =
      await this.userInteractionsRepo.findUserInteractionsCountByUserIP(
        userIP,
        callingServiceName
      );
    return userInteractions ?? 0;
  }

  public async setUserRequestsCount(
    userIP: string,
    callingServiceName: string
  ): Promise<boolean> {
    const userInteractions =
      await this.userInteractionsRepo.addNewUserInteraction({
        userIP,
        callingServiceName
      });

    return !!userInteractions;
  }
}
