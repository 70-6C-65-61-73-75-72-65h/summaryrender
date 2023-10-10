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

    const res: any = await new Promise((res, rej) => {
      const worker = new Worker("./src/services/reporter/worker.js");

      worker.on("message", (message) => {
        res(message);
        // Handle the message received from the worker
        // For example, call a method in another service or store the result
      });
      worker.on("error", (message) => {
        console.log("error");
        console.log(message);
        rej();
      });
      worker.on("exit", (message) => {
        console.log("exit");
        console.log(message);
        // Handle the message received from the worker
        // For example, call a method in another service or store the result
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

    console.log("res after worker");
    console.log(res);

    if (!res.filename) {
      // ... throw  new Error()
    }

    // const res: any = await pdf.create(document, options);
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
