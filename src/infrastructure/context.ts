import type { Kysely } from "kysely";
import type { Logger } from "pino";
import type { OverrideProperties } from "type-fest";

import type { AppContext, AppContextForGuest, AppContextForUser } from "../application/contexts.ts";
import * as Dtos from "../application/dtos.ts";
import { mailerTransport } from "../config/mailer.ts";
import type { DB } from "./datasources/db/types.ts";
import { ConsoleMailer } from "./mailers/console.ts";
import { SmtpMailer } from "./mailers/smtp.ts";
import { toDto } from "./queries/user.ts";
import { SignupRequestRateLimiter } from "./rate-limiters/signup-request.ts";
import { RefreshTokenRepo } from "./repositories/refresh-token.ts";
import { TodoRepo } from "./repositories/todo.ts";
import { UserRepo } from "./repositories/user.ts";
import { RefreshTokenReuseDetector } from "./reuse-detectors/refresh-token.ts";
import { UnitOfWork } from "./unit-of-work.ts";

export async function findAppContextUser(id: Dtos.User.Type["id"], kysely: Kysely<DB>) {
  const user = await kysely
    .selectFrom("users") //
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return user && toDto(user);
}

export function createAppContextForAdmin(input: {
  user: OverrideProperties<Dtos.User.Type, { role: "ADMIN" }>;
  kysely: Kysely<DB>;
  logger: Logger;
}): AppContext {
  const { user, kysely, logger } = input;
  return {
    user,
    logger,
    repos: {
      refreshToken: new RefreshTokenRepo(kysely),
      todo: new TodoRepo(kysely, user.id),
      user: new UserRepo(kysely, user.id),
    },
    unitOfWork: new UnitOfWork(kysely, user.id),
  };
}

export function createAppContextForUser(input: {
  user: OverrideProperties<Dtos.User.Type, { role: "USER" }>;
  kysely: Kysely<DB>;
  logger: Logger;
}): AppContextForUser {
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
    mailer,
    signupRequestRateLimiter,
    refreshTokenReuseDetector,
  };
}

const mailer = (() => {
  switch (mailerTransport) {
    case "console":
      return new ConsoleMailer();
    case "smtp":
      return new SmtpMailer();
  }
})();

const signupRequestRateLimiter = new SignupRequestRateLimiter();
const refreshTokenReuseDetector = new RefreshTokenReuseDetector();
