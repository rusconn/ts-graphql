import type { Transaction } from "kysely";

import type { DB } from "../../../../shared/mod.ts";
import { Dto } from "../../../application/dtos/todo.ts";
import { toDto } from "../todo.ts";

export class TodoQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }
  async find(id: Dto["id"]) {
    const todo = await this.#trx
      .selectFrom("todos") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return todo && toDto(todo);
  }

  async findOrThrow(id: Dto["id"]) {
    const todo = await this.#trx
      .selectFrom("todos") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow();

    return toDto(todo);
  }

  async countTheirs(userId: Dto["userId"]) {
    const result = await this.#trx
      .selectFrom("todos")
      .where("userId", "=", userId)
      .select(({ fn }) => fn.count<number>("userId").as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  }

  async count() {
    const result = await this.#trx
      .selectFrom("todos")
      .select(({ fn }) => fn.count<number>("userId").as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  }
}
