import { TYPES } from "../../constants";
import { IMailerService } from "./../../services/mailer";
import { Response } from "express";
import { inject } from "inversify";
import { controller, httpGet, response } from "inversify-express-utils";

@controller("/api/v1/check")
export class CheckController {
  private mailService: IMailerService;
  public constructor(@inject(TYPES.MailerService) mailService: IMailerService) {
    this.mailService = mailService;
  }

  @httpGet("/")
  public async Check(@response() res: Response) {
    const templateToSend = await this.mailService.readEmailTemplate("default");
    const sendResult = await this.mailService.sendMail(
      "maksym.ulshyn@nixs.com",
      "Report",
      templateToSend
    );
    return res.send({ sendResult, templateToSend });
  }
}
