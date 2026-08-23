import type { Transaction } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";

import type { DB } from "../../../modules/shared/mod.ts";
import { TodoQuery, TodoRepo } from "../../../modules/todo/app.ts";
import { UserQuery } from "../../../modules/user/app.ts";
import { users } from "../../../modules/user/test.ts";
import { createAppContextForAuthed, createAppContextForGuest } from "../../container.ts";
import { pino } from "../../logger.ts";
import type { Context } from "../contexts.ts";

export const contexts = {
  alice: {
    user: users.dtos.alice,
  },
  bob: {
    user: users.dtos.bob,
  },
  guest: {
    user: null,
  },
} satisfies Record<string, ContextForIT>;

export type ContextForIT = Pick<Context, "user">;

export function createContext(ctx: ContextForIT, trx: Transaction<DB>): Context {
  const kyselyReadonly = trx as unknown as ReadonlyKysely<DB>;
  const logger = pino;
  const user: Context["user"] = ctx.user;

  if (user != null) {
    const todoRepo = new TodoRepo(trx, user.id);
    return {
      queries: {
        todo: new TodoQuery(kyselyReadonly, todoRepo, user.id),
        user: new UserQuery(kyselyReadonly, user.id),
      },
      ...createAppContextForAuthed({ user, kysely: trx, logger }),
    } as unknown as Context;
  } else {
    return {
      ...createAppContextForGuest({ kysely: trx, logger }),
    } as unknown as Context;
  }
}
