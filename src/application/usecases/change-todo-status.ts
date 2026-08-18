import type { EmptyObject } from "type-fest";

import { Todo } from "../../domain/entities.ts";
import type { ITodoRepoForAdmin } from "../../domain/repositories/todo/for-admin.ts";
import type { ITodoRepoForUser } from "../../domain/repositories/todo/for-user.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as Dtos from "../dtos.ts";

type Deps = {
  repos: { todo: ITodoRepoForUser | ITodoRepoForAdmin };
};

type Input = {
  id: Todo.Id.Type;
  status: Todo.Status.Type;
};

type Output = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: Dtos.Todo.Type;
  };
}>;

export async function changeTodoStatus(deps: Deps, input: Input): Promise<Output> {
  const { id, status } = input;

  const todo = await deps.repos.todo.find(id);
  if (!todo) {
    return { type: "TodoNotFound" };
  }

  const changedTodo = Todo.changeStatus(todo, status);
  try {
    await deps.repos.todo.update(changedTodo);
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    changed: Dtos.Todo.fromEntity(changedTodo),
  };
}
