import { getReportName, ReportContentType, TYPES } from "../../constants";
import { IMailerService } from "./../../services/mailer";
import { Response } from "express";
import { inject } from "inversify";
import {
  controller,
  httpPost,
  httpPut,
  requestBody,
  response
} from "inversify-express-utils";
import { IReporterService } from "services/reporter";
import { IUserInteractionsDTO } from "models/user-interactions";
import { Worker, isMainThread } from "worker_threads";

export interface IGetReportDTO extends IUserInteractionsDTO {
  to: string;
  subject: string;
  html: string;
}

@controller("/api/report")
export class ReporterController {
  public constructor(
    @inject(TYPES.ReporterService) public reporterService: IReporterService,
    @inject(TYPES.MailerService) public mailerService: IMailerService
  ) {}

  @httpPost("/")
  public async sendReport(
    @response() res: Response,
    @requestBody() getReportDTO: IGetReportDTO
  ) {
    if (
      !(
        getReportDTO.userIP &&
        getReportDTO.callingServiceName &&
        getReportDTO.to &&
        getReportDTO.subject &&
        getReportDTO.html
      )
    ) {
      return res.send({
        error:
          "missing one of the parameters: (userIP, callingServiceName, to, subject, html)"
      });
    }

    const reportResultPath =
      await this.reporterService.generatePDFFromReportTemplate(
        getReportDTO.userIP,
        getReportDTO.callingServiceName
      );

    // const mailSendResult = await this.mailerService.sendMail(
    //   getReportDTO.to,
    //   getReportDTO.subject,
    //   getReportDTO.html,
    //   [
    //     {
    //       contentType: ReportContentType,
    //       filename: getReportName(getReportDTO.userIP),
    //       path: reportResultPath
    //     }
    //   ]
    // );
    return res.send({ reportResultPath, mailSendResult: "" });
  }

  @httpPut("/")
  public async setReportData(
    @response() res: Response,
    @requestBody() setReportDTO: IUserInteractionsDTO
  ) {
    console.log(setReportDTO);
    const reportRes = await this.reporterService.setUserRequestsCount(
      setReportDTO.userIP,
      setReportDTO.callingServiceName
    );
    return res.send({ reportRes });
  }
}
