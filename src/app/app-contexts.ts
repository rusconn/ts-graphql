import type { Logger } from "pino";

import type {
  IRefreshTokenReuseDetector,
  IRefreshTokenRepoForAuthed,
  IRefreshTokenRepoForGuest,
} from "../modules/session/app.ts";
import type { ITodoRepoForAuthed } from "../modules/todo/app.ts";
import {
  UserDto as User,
  type IUserRepoForAuthed,
  type IUserRepoForGuest,
  type Mailer,
  type ISignupRequestRateLimiter,
} from "../modules/user/app.ts";
import type { UnitOfWork } from "./unit-of-work.ts";

export type AppContext = AppContextForAuthed | AppContextForGuest;

export type AppContextForAuthed = {
  user: User;
  logger: Logger;
  repos: {
    refreshToken: IRefreshTokenRepoForAuthed;
    todo: ITodoRepoForAuthed;
    user: IUserRepoForAuthed;
  };
  unitOfWork: UnitOfWork;
};

export type AppContextForGuest = {
  user: null;
  logger: Logger;
  repos: {
    refreshToken: IRefreshTokenRepoForGuest;
    user: IUserRepoForGuest;
  };
  unitOfWork: UnitOfWork;
  mailer: Mailer;
  signupRequestRateLimiter: ISignupRequestRateLimiter;
  refreshTokenReuseDetector: IRefreshTokenReuseDetector;
};
