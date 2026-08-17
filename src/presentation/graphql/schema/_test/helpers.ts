import type { Transaction } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";
import type { Result } from "neverthrow";

import {
  createAppContextForAdmin,
  createAppContextForGuest,
  createAppContextForUser,
} from "../../../../infrastructure/context.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { pino } from "../../../../infrastructure/loggers/pino.ts";
import { TodoQuery } from "../../../../infrastructure/queries/todo.ts";
import { UserQuery } from "../../../../infrastructure/queries/user.ts";
import { TodoRepo } from "../../../../infrastructure/repositories/todo.ts";
import type { Context } from "../../yoga/contexts.ts";
import type { ParseErr } from "../_parsers/_shared/error.ts";
import type { ContextForIT } from "./data.ts";
import * as todos from "./data/nodes/todos.ts";
import * as users from "./data/nodes/users.ts";

export function testParseArgs<Args>(
  parseArgs: (args: Args) => Result<unknown, ParseErr | ParseErr[]>,
  cases: {
    valids: Args[];
    invalids: [Args, (keyof Args)[]][];
  },
) {
  describe("parsing", () => {
    it.each(cases.valids)("succeeds when args is valid: %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed.isOk()).toBe(true);
    });

    it.each(cases.invalids)("failes when args is invalid: %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(parsed.isErr()).toBe(true);
      const err = parsed._unsafeUnwrapErr();
      const errs = Array.isArray(err) ? err : [err];
      expect(errs.map((e) => e.field)).toStrictEqual(fields);
    });
  });
}

export const dummyId = {
  todo: todos.dummyId,
  user: users.dummyId,
};

export function createContext(ctx: ContextForIT, trx: Transaction<DB>): Context {
  const kyselyReadonly = trx as unknown as ReadonlyKysely<DB>;
  const logger = pino;
  const user: Context["user"] = ctx.user;

  switch (user?.role) {
    case "ADMIN": {
      const todoRepo = new TodoRepo(trx);
      return {
        queries: {
          todo: new TodoQuery(kyselyReadonly, todoRepo),
          user: new UserQuery(kyselyReadonly),
        },
        start: 0,
        ...createAppContextForAdmin({ user, kysely: trx, logger }),
      } as unknown as Context;
    }
    case "USER": {
      const todoRepo = new TodoRepo(trx, user.id);
      return {
        queries: {
          todo: new TodoQuery(kyselyReadonly, todoRepo, user.id),
          user: new UserQuery(kyselyReadonly, user.id),
        },
        start: 0,
        ...createAppContextForUser({ user, kysely: trx, logger }),
      } as unknown as Context;
    }
    case undefined:
      return {
        start: 0,
        ...createAppContextForGuest({ kysely: trx, logger }),
      } as unknown as Context;
  }
}
