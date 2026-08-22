import type { Transaction } from "kysely";

import * as Dtos from "../../../application/dtos.ts";
import type { DB } from "../../datasources/db/types.ts";
import { toDto } from "../user.ts";

export class UserQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }

  async find(id: Dtos.User.Type["id"]) {
    const user = await this.#trx
      .selectFrom("users") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return user && toDto(user);
  }

  async findOrThrow(id: Dtos.User.Type["id"]) {
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
