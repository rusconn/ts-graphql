import type { Kysely } from "kysely";

import * as Entity from "../../domain/entities/todo.ts";
import { entityNotFoundError } from "../../domain/errors/entity-not-found.ts";
import type { ITodoRepoForAuthed } from "../../domain/repositories/todo/for-authed.ts";
import { TodoStatus, type DB, type Todo } from "../datasources/db/types.ts";

export class TodoRepo implements ITodoRepoForAuthed {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Entity.Type["userId"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async find(id: Entity.Type["id"]) {
    const todo = await this.#db
      .selectFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .selectAll()
      .executeTakeFirst();

    return todo && toEntity(todo);
  }

  async count() {
    const result = await this.#db
      .selectFrom("todos")
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .executeTakeFirst();

    return result?.count ?? 0;
  }

  async add(todo: Entity.Type) {
    if (this.#tenantId != null && todo.userId !== this.#tenantId) {
      throw new Error("forbidden");
    }

    await this.#db
      .insertInto("todos") //
      .values(toDb(todo))
      .execute();
  }

  async update(todo: Entity.Type) {
    await this.#db
      .updateTable("todos")
      .set(toDb(todo))
      .where("id", "=", todo.id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async remove(id: Entity.Type["id"]) {
    await this.#db
      .deleteFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async removeByUserId(userId: Entity.Type["userId"]) {
    await this.#db
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
