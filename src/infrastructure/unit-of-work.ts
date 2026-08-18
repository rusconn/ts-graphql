import type { Kysely } from "kysely";

import type { IUnitOfWorkForAuthed } from "../application/unit-of-works/for-authed.ts";
import type { IUnitOfWorkForGuest } from "../application/unit-of-works/for-guest.ts";
import type * as Entity from "../domain/entities.ts";
import { runInTransaction } from "../lib/kysely-extra.ts";
import type { DB } from "./datasources/db/types.ts";
import { RefreshTokenRepo } from "./repositories/refresh-token.ts";
import { TodoRepo } from "./repositories/todo.ts";
import { UserRepo } from "./repositories/user.ts";

type UnitOfWorkRepos = {
  refreshToken: RefreshTokenRepo;
  todo: TodoRepo;
  user: UserRepo;
};

export class UnitOfWork implements IUnitOfWorkForAuthed, IUnitOfWorkForGuest {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Entity.User.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  run<T>(work: (repos: UnitOfWorkRepos) => Promise<T>): Promise<T> {
    return runInTransaction(this.#db, (trx) =>
      work({
        refreshToken: new RefreshTokenRepo(trx, this.#tenantId),
        todo: new TodoRepo(trx, this.#tenantId),
        user: new UserRepo(trx, this.#tenantId),
      }),
    );
  }
}
