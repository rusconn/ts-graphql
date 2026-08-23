import type { Kysely } from "kysely";

import { isPgError } from "../../../../lib/pg-extra.ts";
import { PostgreSQLErrorCode } from "../../../../lib/postgresql/error-code.ts";
import { entityNotFoundError, TodoStatus, type DB, type Todo } from "../../../shared/mod.ts";
import { userNotFoundError } from "../../application/errors/user-not-found.ts";
import { Entity } from "../../domain/entities/todo.ts";
import type { ITodoRepoForAuthed } from "../../domain/repositories/todo/for-authed.ts";

export class TodoRepo implements ITodoRepoForAuthed {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Entity["userId"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async find(id: Entity["id"]) {
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

  async add(todo: Entity) {
    if (this.#tenantId != null && todo.userId !== this.#tenantId) {
      throw new Error("forbidden");
    }

    try {
      await this.#db
        .insertInto("todos") //
        .values(toDb(todo))
        .execute();
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PostgreSQLErrorCode.ForeignKeyViolation) {
          if (e.constraint?.includes("user_id")) {
            throw userNotFoundError();
          }
        }
      }
      throw e;
    }
  }

  async update(todo: Entity) {
    await this.#db
      .updateTable("todos")
      .set(toDb(todo))
      .where("id", "=", todo.id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async remove(id: Entity["id"]) {
    await this.#db
      .deleteFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async removeByUserId(userId: Entity["userId"]) {
    await this.#db
      .deleteFrom("todos")
      .where("userId", "=", userId)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .execute();
  }
}

export function toDb({ status, ...rest }: Entity): Todo {
  return {
    ...rest,
    status: toDbStatus[status],
  };
}

export const toDbStatus: Record<Entity["status"], TodoStatus> = {
  [Entity.Status.DONE]: TodoStatus.Done,
  [Entity.Status.PENDING]: TodoStatus.Pending,
};

export function toEntity(todo: Todo): Entity {
  return {
    ...todo,
    status: fromDbStatus[todo.status],
  } as Entity;
}

export const fromDbStatus: Record<TodoStatus, Entity["status"]> = {
  [TodoStatus.Done]: Entity.Status.DONE,
  [TodoStatus.Pending]: Entity.Status.PENDING,
};
