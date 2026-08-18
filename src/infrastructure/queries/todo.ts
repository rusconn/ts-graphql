import type { ReadonlyKysely } from "kysely/readonly";

import * as Dtos from "../../application/dtos.ts";
import type { ITodoQueryForAuthed } from "../../application/queries/todo/for-authed.ts";
import type {
  CountByUserParams,
  FindByUserParams,
  PageByUserParams,
} from "../../application/queries/todo/params.ts";
import type * as Entity from "../../domain/entities.ts";
import type { DB, Todo } from "../datasources/db/types.ts";
import { fromDbStatus, TodoRepo } from "../repositories/todo.ts";
import * as UserTodoCountLoader from "./todo/loaders/user-todo-count.ts";
import * as UserTodoLoader from "./todo/loaders/user-todo.ts";
import * as UserTodosLoader from "./todo/loaders/user-todos.ts";

export class TodoQuery implements ITodoQueryForAuthed {
  #loaders;
  #repo;

  constructor(db: ReadonlyKysely<DB>, repo: TodoRepo, tenantId?: Entity.Todo.Type["userId"]) {
    this.#loaders = {
      userTodo: UserTodoLoader.create(db, tenantId),
      userTodos: UserTodosLoader.create(db, tenantId),
      userTodoCount: UserTodoCountLoader.create(db, tenantId),
    };
    this.#repo = repo;
  }

  async find(id: Entity.Todo.Type["id"]) {
    const todo = await this.#repo.find(id);
    return todo && Dtos.Todo.fromEntity(todo);
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
