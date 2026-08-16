import type { Kysely } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";

import type { AppContext } from "../application/contexts.ts";
import * as Dtos from "../application/dtos.ts";
import { mailerTransport } from "../config/mailer.ts";
import type { DB } from "./datasources/db/types.ts";
import { ConsoleMailer } from "./mailers/console.ts";
import { SmtpMailer } from "./mailers/smtp.ts";
import { TodoQuery } from "./queries/todo.ts";
import { toDto, UserQuery } from "./queries/user.ts";
import { SignupRequestRateLimiter } from "./rate-limiters/signup-request.ts";
import { RefreshTokenRepo } from "./repositories/refresh-token.ts";
import { TodoRepo } from "./repositories/todo.ts";
import { UserRepo } from "./repositories/user.ts";
import { UnitOfWork } from "./unit-of-work.ts";

export async function findAppContextUser(id: Dtos.User.Type["id"], kysely: Kysely<DB>) {
  const user = await kysely
    .selectFrom("users") //
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return user && toDto(user);
}

export function createAppContext(input: {
  user: AppContext["user"];
  kysely: Kysely<DB>;
}): AppContext {
  const { user, kysely } = input;
  const kyselyReadonly = kysely as unknown as ReadonlyKysely<DB>;

  switch (user?.role) {
    case "ADMIN":
      return {
        role: user.role,
        user,
        queries: {
          todo: new TodoQuery(kyselyReadonly, new TodoRepo(kysely)),
          user: new UserQuery(kyselyReadonly),
        },
        repos: {
          refreshToken: new RefreshTokenRepo(kysely),
          todo: new TodoRepo(kysely, user.id),
          user: new UserRepo(kysely, user.id),
        },
        unitOfWork: new UnitOfWork(kysely, user.id),
      };
    case "USER": {
      const todoRepo = new TodoRepo(kysely, user.id);
      return {
        role: user.role,
        user,
        queries: {
          todo: new TodoQuery(kyselyReadonly, todoRepo, user.id),
          user: new UserQuery(kyselyReadonly, user.id),
        },
        repos: {
          refreshToken: new RefreshTokenRepo(kysely),
          todo: todoRepo,
          user: new UserRepo(kysely, user.id),
        },
        unitOfWork: new UnitOfWork(kysely, user.id),
      };
    }
    case undefined:
      return {
        role: "GUEST",
        user,
        repos: {
          refreshToken: new RefreshTokenRepo(kysely),
          user: new UserRepo(kysely),
        },
        unitOfWork: new UnitOfWork(kysely),
        mailer,
        signupRequestRateLimiter,
      };
    default:
      throw new Error(user satisfies never);
  }
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
