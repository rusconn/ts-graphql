import type { Transaction } from "kysely";

import * as Dto from "../../../../../application/dto.ts";
import type { DB } from "../../../../../infrastructure/datasources/db/types.ts";
import { toDto } from "../../../../../infrastructure/queries/todo.ts";

export class TodoQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }
  async find(id: Dto.Todo.Type["id"]) {
    const todo = await this.#trx
      .selectFrom("todos") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return todo && toDto(todo);
  }

  async findOrThrow(id: Dto.Todo.Type["id"]) {
    const todo = await this.#trx
      .selectFrom("todos") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow();

    return toDto(todo);
  }

  async countTheirs(userId: Dto.Todo.Type["userId"]) {
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
