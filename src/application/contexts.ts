import type { Logger } from "pino";
import type { OverrideProperties } from "type-fest";

import type { IRefreshTokenRepoForAdmin } from "../domain/repositories/refresh-token/for-admin.ts";
import type { IRefreshTokenRepoForGuest } from "../domain/repositories/refresh-token/for-guest.ts";
import type { IRefreshTokenRepoForUser } from "../domain/repositories/refresh-token/for-user.ts";
import type { ITodoRepoForAdmin } from "../domain/repositories/todo/for-admin.ts";
import type { ITodoRepoForUser } from "../domain/repositories/todo/for-user.ts";
import type { IUserRepoForAdmin } from "../domain/repositories/user/for-admin.ts";
import type { IUserRepoForGuest } from "../domain/repositories/user/for-guest.ts";
import type { IUserRepoForUser } from "../domain/repositories/user/for-user.ts";
import * as Dtos from "./dtos.ts";
import type { Mailer } from "./mailers/mailer.ts";
import type { ITodoQueryForAdmin } from "./queries/todo/for-admin.ts";
import type { ITodoQueryForUser } from "./queries/todo/for-user.ts";
import type { IUserQueryForAdmin } from "./queries/user/for-admin.ts";
import type { IUserQueryForUser } from "./queries/user/for-user.ts";
import type { ISignupRequestRateLimiter } from "./rate-limiters/signup-request.ts";
import type { IRefreshTokenReuseDetector } from "./reuse-detectors/refresh-token.ts";
import type { IUnitOfWorkForAdmin } from "./unit-of-works/for-admin.ts";
import type { IUnitOfWorkForGuest } from "./unit-of-works/for-guest.ts";
import type { IUnitOfWorkForUser } from "./unit-of-works/for-user.ts";

export type AppContext = AppContextForAdmin | AppContextForUser | AppContextForGuest;
export type AppContextForAuthed = AppContextForAdmin | AppContextForUser;

export type AppContextForAdmin = {
  role: "ADMIN";
  user: OverrideProperties<Dtos.User.Type, { role: "ADMIN" }>;
  logger: Logger;
  queries: {
    todo: ITodoQueryForAdmin;
    user: IUserQueryForAdmin;
  };
  repos: {
    refreshToken: IRefreshTokenRepoForAdmin;
    todo: ITodoRepoForAdmin;
    user: IUserRepoForAdmin;
  };
  unitOfWork: IUnitOfWorkForAdmin;
};

export type AppContextForUser = {
  role: "USER";
  user: OverrideProperties<Dtos.User.Type, { role: "USER" }>;
  logger: Logger;
  queries: {
    todo: ITodoQueryForUser;
    user: IUserQueryForUser;
  };
  repos: {
    refreshToken: IRefreshTokenRepoForUser;
    todo: ITodoRepoForUser;
    user: IUserRepoForUser;
  };
  unitOfWork: IUnitOfWorkForUser;
};

export type AppContextForGuest = {
  role: "GUEST";
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
