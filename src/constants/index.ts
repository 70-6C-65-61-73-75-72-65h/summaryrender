export const TYPES = {
  MailerService: Symbol("MailerService"),
  WinstonLogger: Symbol("WinstonLogger")
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
