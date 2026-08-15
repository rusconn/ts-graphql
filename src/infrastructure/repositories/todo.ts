import type { Transaction } from "kysely";

import * as Entity from "../../domain/entities/todo.ts";
import { entityNotFoundError } from "../../domain/errors/entity-not-found.ts";
import type { ITodoRepoForAdmin } from "../../domain/repositories/todo/for-admin.ts";
import type { ITodoRepoForUser } from "../../domain/repositories/todo/for-user.ts";
import { TodoStatus, type DB, type Todo } from "../datasources/db/types.ts";

export class TodoRepo implements ITodoRepoForAdmin, ITodoRepoForUser {
  #trx;
  #tenantId;

  constructor(trx: Transaction<DB>, tenantId?: Entity.Type["userId"]) {
    this.#trx = trx;
    this.#tenantId = tenantId;
  }

  async add(todo: Entity.Type) {
    if (this.#tenantId != null && todo.userId !== this.#tenantId) {
      throw new Error("forbidden");
    }

    await this.#trx
      .insertInto("todos") //
      .values(toDb(todo))
      .execute();
  }

  async update(todo: Entity.Type) {
    await this.#trx
      .updateTable("todos")
      .set(toDb(todo))
      .where("id", "=", todo.id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async remove(id: Entity.Type["id"]) {
    await this.#trx
      .deleteFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async removeByUserId(userId: Entity.Type["userId"]) {
    await this.#trx
      .deleteFrom("todos")
      .where("userId", "=", userId)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .execute();
  }
}

export function toDb({ status, ...rest }: Entity.Type): Todo {
  return {
    ...rest,
    status: toDbStatus[status],
  };
}

export const toDbStatus: Record<Entity.Type["status"], TodoStatus> = {
  [Entity.Status.DONE]: TodoStatus.Done,
  [Entity.Status.PENDING]: TodoStatus.Pending,
};

export function toEntity(todo: Todo): Entity.Type {
  return {
    ...todo,
    status: fromDbStatus[todo.status],
  } as Entity.Type;
}

export const fromDbStatus: Record<TodoStatus, Entity.Status.Type> = {
  [TodoStatus.Done]: Entity.Status.DONE,
  [TodoStatus.Pending]: Entity.Status.PENDING,
};
