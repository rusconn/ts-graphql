import type { Kysely } from "kysely";
import type { Logger } from "pino";

import type { AppContextForGuest, AppContextForAuthed } from "../application/contexts.ts";
import { mailerTransport } from "../config/mailer.ts";
import type { Uuidv7 } from "../util/uuid/v7.ts";
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

export async function findAppContextUser(id: Uuidv7, kysely: Kysely<DB>) {
  const user = await kysely
    .selectFrom("users") //
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return user && toDto(user);
}

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

const signupRequestRateLimiter = new SignupRequestRateLimiter();
const refreshTokenReuseDetector = new RefreshTokenReuseDetector();
