export { mailerTransport } from "./config/mailer.ts";

export type { IUserRepoForAuthed } from "./domain/repositories/user/for-authed.ts";
export type { IUserRepoForGuest } from "./domain/repositories/user/for-guest.ts";

export { Dto as UserDto } from "./application/dtos/user.ts";
export type { Mailer } from "./application/mailers/mailer.ts";
export type { ISignupRequestRateLimiter } from "./application/rate-limiters/signup-request.ts";
export type { IUserQueryForAuthed } from "./application/queries/user/for-authed.ts";

export { findAppContextUser } from "./infrastructure/find-app-context-user.ts";
export { ConsoleMailer } from "./infrastructure/mailers/console.ts";
export { SmtpMailer } from "./infrastructure/mailers/smtp.ts";
export { SignupRequestRateLimiter } from "./infrastructure/rate-limiters/signup-request.ts";
export { UserQuery } from "./infrastructure/queries/user.ts";
export { UserRepo } from "./infrastructure/repositories/user.ts";

export * from "./presentation/mod.ts";
