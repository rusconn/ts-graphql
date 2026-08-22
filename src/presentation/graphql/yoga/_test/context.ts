import type { Transaction } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";

import { dtos } from "../../../../application/dtos/_test/users.ts";
import {
  createAppContextForAuthed,
  createAppContextForGuest,
} from "../../../../infrastructure/context.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { pino } from "../../../../infrastructure/loggers/pino.ts";
import { TodoQuery } from "../../../../infrastructure/queries/todo.ts";
import { UserQuery } from "../../../../infrastructure/queries/user.ts";
import { TodoRepo } from "../../../../infrastructure/repositories/todo.ts";
import type { Context } from "../contexts.ts";

export const contexts = {
  alice: {
    user: dtos.alice,
  },
  bob: {
    user: dtos.bob,
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
