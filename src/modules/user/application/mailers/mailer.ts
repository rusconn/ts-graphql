import type { Entity as UserEntity } from "../../domain/entities/user.ts";

export type SendEmailVerificationParams = {
  to: UserEntity["email"];
  url: string;
  subject: string;
  text: string;
};

export interface Mailer {
  sendEmailVerification(params: SendEmailVerificationParams): Promise<void>;
}
