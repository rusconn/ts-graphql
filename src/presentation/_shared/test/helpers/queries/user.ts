import type { Transaction } from "kysely";

import * as Dto from "../../../../../application/dto.ts";
import type { DB } from "../../../../../infrastructure/datasources/db/types.ts";
import { toDto } from "../../../../../infrastructure/queries/user.ts";

export class UserQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }

  async find(id: Dto.User.Type["id"]) {
    const user = await this.#trx
      .selectFrom("users") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return user && toDto(user);
  }

  async findOrThrow(id: Dto.User.Type["id"]) {
    const user = await this.#trx
      .selectFrom("users") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow();

    return toDto(user);
  }

  async count() {
    const result = await this.#trx
      .selectFrom("users")
      .select(({ fn }) => fn.count<number>("id").as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  }
}
