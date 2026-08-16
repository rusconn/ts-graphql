import type { Mailer, SendEmailVerificationParams } from "../../application/mailers/mailer.ts";
import { pino } from "../loggers/pino.ts";

export class ConsoleMailer implements Mailer {
  async sendEmailVerification(params: SendEmailVerificationParams) {
    pino.info(
      {
        mailer: "console",
        to: params.to,
        subject: params.subject,
        url: params.url,
      },
      "send-email-verification",
    );
  }
}
