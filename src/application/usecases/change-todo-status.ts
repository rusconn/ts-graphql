import type { EmptyObject } from "type-fest";

import * as TodoEntity from "../../domain/entities/todo.ts";
import type { ITodoRepoForAuthed } from "../../domain/repositories/todo/for-authed.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as TodoDto from "../dtos/todo.ts";

type Deps = {
  repos: { todo: ITodoRepoForAuthed };
};

type Input = {
  id: TodoEntity.Id.Type;
  status: TodoEntity.Status.Type;
};

type Output = DiscriminatedUnion<{
  TodoNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: TodoDto.Type;
  };
}>;

export async function changeTodoStatus(deps: Deps, input: Input): Promise<Output> {
  const { id, status } = input;

  const todo = await deps.repos.todo.find(id);
  if (!todo) {
    return { type: "TodoNotFound" };
  }

  const changedTodo = TodoEntity.changeStatus(todo, status);
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
    changed: TodoDto.fromEntity(changedTodo),
  };
}
