import nodemailer from "nodemailer";

import type { Mailer, SendEmailVerificationParams } from "../../application/mailers/mailer.ts";
import { smtpConfig } from "../../config/mailer.ts";
import { pino } from "../loggers/pino.ts";

export class SmtpMailer implements Mailer {
  #transporter;
  #from;

  constructor() {
    const { host, port, user, password, from } = smtpConfig;
    this.#from = from;
    this.#transporter = nodemailer.createTransport({
      host,
      port,
      ...(user !== "" && {
        auth: {
          user,
          pass: password,
        },
      }),
    });
  }

  async sendEmailVerification(params: SendEmailVerificationParams) {
    const info = await this.#transporter.sendMail({
      from: this.#from,
      to: params.to,
      subject: params.subject,
      text: params.text,
    });

    pino.info(
      {
        mailer: "smtp",
        messageId: info.messageId,
      },
      "send-email-verification",
    );
  }
}
