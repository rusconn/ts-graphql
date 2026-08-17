import nodemailer from "nodemailer";
import type { Logger } from "pino";

import type { Mailer, SendEmailVerificationParams } from "../../application/mailers/mailer.ts";
import { smtpConfig } from "../../config/mailer.ts";

const { host, port, user, password, from } = smtpConfig;

const transporter = nodemailer.createTransport({
  host,
  port,
  ...(user !== "" && {
    auth: {
      user,
      pass: password,
    },
  }),
});

export class SmtpMailer implements Mailer {
  #logger: Logger;

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  async sendEmailVerification(params: SendEmailVerificationParams) {
    const info = await transporter.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
    });

    this.#logger.info(
      {
        mailer: "smtp",
        messageId: info.messageId,
      },
      "send-email-verification",
    );
  }
}
