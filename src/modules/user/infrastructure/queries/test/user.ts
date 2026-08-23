import type { Transaction } from "kysely";

import type { DB } from "../../../../shared/mod.ts";
import { Dto } from "../../../application/dtos/user.ts";
import { toDto } from "../user.ts";

export class UserQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }

  async find(id: Dto["id"]) {
    const user = await this.#trx
      .selectFrom("users") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return user && toDto(user);
  }

  async findOrThrow(id: Dto["id"]) {
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
