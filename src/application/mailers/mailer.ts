import type * as Entities from "../../domain/entities.ts";

export type SendEmailVerificationParams = {
  to: Entities.User.Type["email"];
  url: string;
  subject: string;
  text: string;
};

export interface Mailer {
  sendEmailVerification(params: SendEmailVerificationParams): Promise<void>;
}
