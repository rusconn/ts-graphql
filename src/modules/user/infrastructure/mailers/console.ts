import type { Logger } from "pino";

import type { Mailer, SendEmailVerificationParams } from "../../application/mailers/mailer.ts";

export class ConsoleMailer implements Mailer {
  #logger: Logger;

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  async sendEmailVerification(params: SendEmailVerificationParams) {
    this.#logger.info(
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
