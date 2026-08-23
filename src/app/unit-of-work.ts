import type { Kysely } from "kysely";

import { runInTransaction } from "../lib/kysely-extra.ts";
import { RefreshTokenRepo } from "../modules/session/app.ts";
import type { DB } from "../modules/shared/mod.ts";
import { TodoRepo } from "../modules/todo/app.ts";
import { UserRepo } from "../modules/user/app.ts";
import type { UserEntity } from "../modules/user/mod.ts";

type UnitOfWorkRepos = {
  refreshToken: RefreshTokenRepo;
  todo: TodoRepo;
  user: UserRepo;
};

export class UnitOfWork {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: UserEntity["id"]) {
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
