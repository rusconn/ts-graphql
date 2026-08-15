import type { ReadonlyKysely } from "kysely/readonly";

import * as Dtos from "../../application/dtos.ts";
import type { ITodoQueryForAdmin } from "../../application/queries/todo/for-admin.ts";
import type { ITodoQueryForUser } from "../../application/queries/todo/for-user.ts";
import type {
  CountByUserParams,
  FindByUserParams,
  PageByUserParams,
} from "../../application/queries/todo/params.ts";
import type * as Entity from "../../domain/entities.ts";
import type { DB, Todo } from "../datasources/db/types.ts";
import { fromDbStatus } from "../repositories/todo.ts";
import * as UserTodoCountLoader from "./todo/loaders/user-todo-count.ts";
import * as UserTodoLoader from "./todo/loaders/user-todo.ts";
import * as UserTodosLoader from "./todo/loaders/user-todos.ts";

export class TodoQuery implements ITodoQueryForAdmin, ITodoQueryForUser {
  #db;
  #loaders;
  #tenantId;

  constructor(db: ReadonlyKysely<DB>, tenantId?: Entity.Todo.Type["userId"]) {
    this.#db = db;
    this.#loaders = {
      userTodo: UserTodoLoader.create(db, tenantId),
      userTodos: UserTodosLoader.create(db, tenantId),
      userTodoCount: UserTodoCountLoader.create(db, tenantId),
    };
    this.#tenantId = tenantId;
  }

  async find(id: Entity.Todo.Type["id"]) {
    const todo = await this.#db
      .selectFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .selectAll()
      .executeTakeFirst();

    return todo && toDto(todo);
  }

  async findByUser(params: FindByUserParams) {
    const todo = await this.#loaders.userTodo.load(params);
    return todo && toDto(todo);
  }

  async pageByUser(params: PageByUserParams) {
    const todos = await this.#loaders.userTodos.load(params);
    return todos.map(toDto);
  }

  async countByUser(params: CountByUserParams) {
    return await this.#loaders.userTodoCount.load(params);
  }
}

export function toDto(todo: Todo): Dtos.Todo.Type {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    status: fromDbStatus[todo.status],
    userId: todo.userId,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  } as Dtos.Todo.Type;
}
