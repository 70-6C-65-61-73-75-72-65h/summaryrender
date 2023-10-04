import * as nodemailer from "nodemailer";
import mailgunTransport from "nodemailer-mailgun-transport";
// import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { inject, injectable } from "inversify";
import { TYPES } from "../../constants";
import Mail from "nodemailer/lib/mailer";
import { Logger } from "winston";
import { Eta } from "eta";

export interface IMailerService {
  readEmailTemplate(templateName: string): Promise<string>;
  sendMail(
    to: string,
    subject: string,
    html: string
  ): Promise<nodemailer.SentMessageInfo>;
}

@injectable()
export class MailerService implements IMailerService {
  private transport: Mail;
  private fromAddress: string;
  private eta: Eta;
  private logger: Logger;

  public constructor(@inject(TYPES.WinstonLogger) logger: Logger) {
    this.logger = logger;
    this.eta = new Eta({
      views: path.join(__dirname, "/templates/")
    });
    this.logger = logger;
    this.fromAddress = process.env.MAIL_FROM_ADDRESS!;

    if (process.env.MAIL_TRANSPORT) {
      if (process.env.MAIL_TRANSPORT?.toUpperCase?.() === "MAILGUN") {
        this.transport = nodemailer.createTransport(
          mailgunTransport({
            auth: {
              api_key: process.env.MAILGUN_API_KEY!,
              domain: process.env.MAILGUN_DOMAIN!
            }
          })
        );
      } else {
        this.transport = nodemailer.createTransport({
          service: process.env.MAIL_TRANSPORT,
          secure: !!process.env.MAIL_TRANSPORT_IS_SECURE, // upgrade later with STARTTLS
          auth: {
            user: process.env.MAIL_TRANSPORT_USER!,
            pass: process.env.MAIL_TRANSPORT_PASSWORD!
          }
        });
      }
    } else {
      this.transport = nodemailer.createTransport({
        host: process.env.MAIL_TRANSPORT_HOST!,
        port: +process.env.MAIL_TRANSPORT_PORT!,
        secure: !!process.env.MAIL_TRANSPORT_IS_SECURE,
        auth: {
          user: process.env.MAIL_TRANSPORT_USER!,
          pass: process.env.MAIL_TRANSPORT_PASSWORD!
        }
      });
    }
  }

  public async readEmailTemplate(templateName: string): Promise<string> {
    const res = await new Promise<string>((res, rej) => {
      this.eta
        .renderAsync(templateName, { message: "Hello!" })
        .then((result: string) => {
          res(result);
        });
    });
    return res;
  }

  public async sendMail(
    to: string,
    subject: string,
    html: string
  ): Promise<nodemailer.SentMessageInfo> {
    try {
      const mailOptions = <Mail.Options>{
        from: this.fromAddress,
        to,
        subject,
        html
      };

      return await this.transport.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}

// hbs

// const emailTemplateSource = fs.readFileSync(
//   path.join(__dirname, "./templates/default.hbs"),
//   "utf8"
// );

// const template = handlebars.compile(emailTemplateSource);

// const htmlToSend = template({ message: "Hello!" });
