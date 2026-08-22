import type { Logger } from "pino";

import type { IRefreshTokenRepoForAuthed } from "../domain/repositories/refresh-token/for-authed.ts";
import type { IRefreshTokenRepoForGuest } from "../domain/repositories/refresh-token/for-guest.ts";
import type { ITodoRepoForAuthed } from "../domain/repositories/todo/for-authed.ts";
import type { IUserRepoForAuthed } from "../domain/repositories/user/for-authed.ts";
import type { IUserRepoForGuest } from "../domain/repositories/user/for-guest.ts";
import * as User from "./dtos/user.ts";
import type { Mailer } from "./mailers/mailer.ts";
import type { ISignupRequestRateLimiter } from "./rate-limiters/signup-request.ts";
import type { IRefreshTokenReuseDetector } from "./reuse-detectors/refresh-token.ts";
import type { IUnitOfWorkForAuthed } from "./unit-of-works/for-authed.ts";
import type { IUnitOfWorkForGuest } from "./unit-of-works/for-guest.ts";

export type AppContext = AppContextForAuthed | AppContextForGuest;

export type AppContextForAuthed = {
  user: User.Type;
  logger: Logger;
  repos: {
    refreshToken: IRefreshTokenRepoForAuthed;
    todo: ITodoRepoForAuthed;
    user: IUserRepoForAuthed;
  };
  unitOfWork: IUnitOfWorkForAuthed;
};

export type AppContextForGuest = {
  user: null;
  logger: Logger;
  repos: {
    refreshToken: IRefreshTokenRepoForGuest;
    user: IUserRepoForGuest;
  };
  unitOfWork: IUnitOfWorkForGuest;
  mailer: Mailer;
  signupRequestRateLimiter: ISignupRequestRateLimiter;
  refreshTokenReuseDetector: IRefreshTokenReuseDetector;
};
