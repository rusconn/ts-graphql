import type * as User from "../../domain/entities/user.ts";

export type SendEmailVerificationParams = {
  to: User.Type["email"];
  url: string;
  subject: string;
  text: string;
};

export interface Mailer {
  sendEmailVerification(params: SendEmailVerificationParams): Promise<void>;
}
