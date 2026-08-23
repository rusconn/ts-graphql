import type { Kysely } from "kysely";
import type { Logger } from "pino";

import { RefreshTokenRepo, RefreshTokenReuseDetector } from "../modules/session/app.ts";
import type { DB } from "../modules/shared/mod.ts";
import { TodoRepo } from "../modules/todo/app.ts";
import {
  mailerTransport,
  ConsoleMailer,
  SmtpMailer,
  SignupRequestRateLimiter,
  UserRepo,
} from "../modules/user/app.ts";
import type { AppContextForGuest, AppContextForAuthed } from "./app-contexts.ts";
import { getValkey } from "./datasources/valkey/client.ts";
import { RateLimitBucketRepo } from "./datasources/valkey/rate-limit-bucket.ts";
import { UnitOfWork } from "./unit-of-work.ts";

export function createAppContextForAuthed(input: {
  user: AppContextForAuthed["user"];
  kysely: Kysely<DB>;
  logger: Logger;
}): AppContextForAuthed {
  const { user, kysely, logger } = input;
  const todoRepo = new TodoRepo(kysely, user.id);
  return {
    user,
    logger,
    repos: {
      refreshToken: new RefreshTokenRepo(kysely),
      todo: todoRepo,
      user: new UserRepo(kysely, user.id),
    },
    unitOfWork: new UnitOfWork(kysely, user.id),
  };
}

export function createAppContextForGuest(input: {
  kysely: Kysely<DB>;
  logger: Logger;
}): AppContextForGuest {
  const { kysely, logger } = input;
  return {
    user: null,
    logger,
    repos: {
      refreshToken: new RefreshTokenRepo(kysely),
      user: new UserRepo(kysely),
    },
    unitOfWork: new UnitOfWork(kysely),
    mailer: createMailer(logger),
    signupRequestRateLimiter,
    refreshTokenReuseDetector,
  };
}

function createMailer(logger: Logger) {
  switch (mailerTransport) {
    case "console":
      return new ConsoleMailer(logger);
    case "smtp":
      return new SmtpMailer(logger);
  }
}

const signupRequestRateLimiter = new SignupRequestRateLimiter(new RateLimitBucketRepo());
const refreshTokenReuseDetector = new RefreshTokenReuseDetector(getValkey);
