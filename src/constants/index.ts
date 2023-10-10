export const TYPES = {
  Middleware: Symbol("Middleware"),
  WorkerService: Symbol("WorkerService"),
  MailerService: Symbol("MailerService"),
  WinstonLogger: Symbol("WinstonLogger"),
  UserInteractionsRepository: Symbol("UserInteractionsRepository"),
  MongoDbService: Symbol("MongoDbService"),
  ReporterService: Symbol("ReporterService")
};

const EmailProviders = [
  "1und1",
  "AOL",
  "DebugMail.io",
  "DynectEmail",
  "FastMail",
  "GandiMail",
  "Gmail",
  "Godaddy",
  "GodaddyAsia",
  "GodaddyEurope",
  "hot.ee",
  "Hotmail",
  "iCloud",
  "mail.ee",
  "Mailgun",
  "Mailjet",
  "Mandrill",
  "Naver",
  "Postmark",
  "QQ",
  "QQex",
  "SendCloud",
  "SendGrid",
  "SES",
  "Sparkpost",
  "Yahoo",
  "Zoho"
];

export const MailServiceRegex = new RegExp(
  `^(${EmailProviders.join("|")})$`,
  "i"
);
// const isMatch = MailServiceRegex.test(testString);
// create some checks on this list while reading config file

export const getReportName = (userIP: string) =>
  `Report-for-user-with-ip-${userIP}.pdf`;
export const ReportContentType = "application/pdf";
